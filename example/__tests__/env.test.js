import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'react-native-harness';
import Config from 'superconfig';

describe('Test Env here', () => {
  beforeEach(() => {
    console.log('Setting up test...');
  });

  afterEach(() => {
    console.log('Cleaning up test...');
  });

  it('should read basic config values', () => {
    expect(Config['PORT']).toBe('3000');
    expect(Config['NODE_ENV']).toBe('development');
    expect(Config['HOST']).toBe('localhost');
    expect(Config['ENABLE_CACHE']).toBe('true');
  });

  it('should handle quoted values', () => {
    expect(Config['DB_NAME']).toBe('my database');
    expect(Config['DB_USER']).toBe('admin');
    expect(Config['DB_PASS']).toBe('p@ss word with spaces');
  });

  it('should handle special characters and urls', () => {
    expect(Config['JWT_SECRET']).toBe('abc$#@!^&*()_+=-');
    expect(Config['REGEX_PATTERN']).toBe('^[a-zA-Z0-9_]+$');
    expect(Config['DATABASE_URL']).toBe('postgres://user:pass@host:5432/db?ssl=true');
    expect(Config['TOKEN']).toBe('abc=def=ghi');
    expect(Config['URL']).toBe('https://example.com/api?x=1&y=2');
  });

  it('should handle empty and null-like values', () => {
    expect(Config['EMPTY']).toBe('');
    expect(Config['NULL_VALUE']).toBe('');
    expect(Config['UNDEFINED_VALUE']).toBe('');
  });

  it('should ignore comments and strip inline comments', () => {
    expect(Config['INLINE_COMMENT']).toBe('hello');
    expect(Config['# This is a full line comment']).toBeUndefined();
  });

  it('should handle escaped characters', () => {
    expect(Config['NEWLINE']).toBe('hello\nworld');
    expect(Config['TAB']).toBe('hello\tworld');
    expect(Config['BACKSLASH']).toBe('C:\\Program Files\\App');
  });

  it('should support export syntax', () => {
    expect(Config['EXPORTED_PORT']).toBe('8080');
    expect(Config['EXPORTED_ENV']).toBe('production');
  });

  it('should keep numbers and booleans as strings', () => {
    expect(Config['INT_VALUE']).toBe('42');
    expect(Config['FLOAT_VALUE']).toBe('3.14');
    expect(Config['BOOL_TRUE']).toBe('true');
    expect(Config['BOOL_FALSE']).toBe('false');
    expect(Config['STRING_NUMBER']).toBe('42');
  });

  it('should resolve duplicate keys with last one winning', () => {
    expect(Config['DUP_KEY']).toBe('second');
  });

  it('should support variable expansion', () => {
    expect(Config['BASE_HOST']).toBe('localhost');
    expect(Config['BASE_PORT']).toBe('3000');
    expect(Config['BASE_URL']).toBe('http://localhost:3000');
  });

  it('should support weird but valid keys', () => {
    expect(Config['__PRIVATE__']).toBe('secret');
    expect(Config['_123']).toBe('numbered');
    expect(Config['A_B_C']).toBe('value');
  });

  it('should support unicode and emoji', () => {
    expect(Config['APP_NAME']).toBe('नमस्ते🚀');
    expect(Config['CURRENCY']).toBe('₹');
    expect(Config['EMOJI']).toBe('🔥');
  });

  it('should support multiline values', () => {
    expect(Config['PRIVATE_KEY']).toContain('-----BEGIN KEY-----');
    expect(Config['PRIVATE_KEY']).toContain('line1');
    expect(Config['PRIVATE_KEY']).toContain('line2');
    expect(Config['PRIVATE_KEY']).toContain('-----END KEY-----');
  });

  it('should trim trailing spaces', () => {
    expect(Config['TRAILING_SPACE']).toBe('hello');
    expect(Config['ANOTHER_TRAILING']).toBe('world');
  });

  it('should allow equals inside values', () => {
    expect(Config['EQUALS_IN_VALUE']).toBe('a=b=c=d');
  });

  it('should skip keys marked with # skip-superconfig', () => {
    expect(Config['SKIPPED_KEY']).toBeUndefined();
    expect(Config['SKIPPED_QUOTED']).toBeUndefined();
    expect(Config['SKIPPED_WITH_COMMENT']).toBeUndefined();
  });

  it('should resume normal parsing after a skipped key', () => {
    expect(Config['AFTER_SKIP']).toBe('included');
    expect(Config['API_URL']).toBe('https://api.example.com');
  });

  it('should ignore or safely handle invalid lines', () => {
    expect(Config['']).toBeUndefined(); // from "=novalue"
    expect(Config['NO_EQUALS_LINE']).toBeUndefined();
    expect(Config['"UNFINISHED_QUOTE']).toBe('oops');
  });
});
