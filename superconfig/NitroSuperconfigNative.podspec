require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "NativeSuperConfig"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/riteshshukla04/react-native-superconfig.git", :tag => "#{s.version}" }



  s.source_files = [
    "ios/**/*.{m,mm}",
    "ios/**/*.{h}",
 
  ]
  
  s.public_header_files = "ios/ConfigGetter.h"

  s.pod_target_xcconfig = {
    # limit C++ std to C++20
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    'DEFINES_MODULE' => 'YES',
  }

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
