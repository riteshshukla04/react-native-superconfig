require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "NitroSuperconfig"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/mrousavy/nitro.git", :tag => "#{s.version}" }

  # Generate configGetter.hpp from .env file before each build
  s.script_phase = {
    :name => 'Generate Superconfig',
    :script => 'bash "${PODS_TARGET_SRCROOT}/scripts/generate-config.sh"',
    :execution_position => :before_compile
  }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]

  load 'nitrogen/generated/ios/NitroSuperconfig+autolinking.rb'
  add_nitrogen_files(s)

  # Inject env vars as Xcode build settings for Info.plist substitution (opt-in via injectBuildVars)
  xcconfig_path = File.join(__dir__, 'superconfig-env.xcconfig')
  if File.exist?(xcconfig_path)
    env_settings = {}
    File.readlines(xcconfig_path).each do |line|
      line = line.strip
      next if line.empty? || line.start_with?('//')
      key, value = line.split(' = ', 2)
      env_settings[key.strip] = value.strip if key && value
    end
    s.user_target_xcconfig = env_settings unless env_settings.empty?
  end

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
