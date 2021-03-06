import fs from 'fs';
import genDiff from '../src/';

const filePathToBeforeJSON = '__tests__/fixtures/before.json';
const filePathToBeforeYML = '__tests__/fixtures/before.yml';
const filePathToBeforeINI = '__tests__/fixtures/before.ini';
const filePathToAfterJSON = '__tests__/fixtures/after.json';
const filePathToAfterYML = '__tests__/fixtures/after.yml';
const filePathToAfterINI = '__tests__/fixtures/after.ini';

const filePathToBeforeNestedJSON = '__tests__/fixtures/before-nested.json';
const filePathToAfterNestedJSON = '__tests__/fixtures/after-nested.json';
const filePathToBeforeNestedINI = '__tests__/fixtures/before-nested.ini';
const filePathToAfterNestedINI = '__tests__/fixtures/after-nested.ini';

const filePathToBeforeNestedDiffTypesJSON = '__tests__/fixtures/before-nested-different-types.json';
const filePathToAfterNestedDiffTypesJSON = '__tests__/fixtures/after-nested-different-types.json';


describe('Compares two configuration files', () => {
  const expectedString =
`{
    host: hexlet.io
  + timeout: 20
  - timeout: 50
  - proxy: 123.234.53.22
  + verbose: true
}`;

  test('JSON', () => {
    expect(genDiff(filePathToBeforeJSON, filePathToAfterJSON)).toBe(expectedString);
  });

  test('YML', () => {
    expect(genDiff(filePathToBeforeYML, filePathToAfterYML)).toBe(expectedString);
  });

  test('INI', () => {
    expect(genDiff(filePathToBeforeINI, filePathToAfterINI)).toBe(expectedString);
  });

  const expectedStringBefore =
`{
    host: hexlet.io
    timeout: 50
    proxy: 123.234.53.22
}`;

  test('should return the same config for identical configs', () => {
    expect(genDiff(filePathToBeforeJSON, filePathToBeforeJSON)).toBe(expectedStringBefore);
  });
});


describe('Unsupported markup format', () => {
  const filePathToBeforeXML = '__tests__/fixtures/before.xml';
  test('should throw error', () => {
    expect(() => genDiff(filePathToBeforeXML, filePathToBeforeXML))
      .toThrowError(new Error('Unsupported file format'));
  });
});


describe('Compares two Recursive files', () => {
  const expectedNestedString =
`{
    common: {
        setting1: Value 1
      - setting2: 200
        setting3: true
      - setting6: {
            key: value
        }
      + setting4: blah blah
      + setting5: {
            key5: value5
        }
    }
    group1: {
      + baz: bars
      - baz: bas
        foo: bar
    }
  - group2: {
        abc: 12345
    }
  + group3: {
        fee: 100500
    }
}`;

  test('JSON-Nested', () => {
    expect(genDiff(filePathToBeforeNestedJSON, filePathToAfterNestedJSON))
      .toBe(expectedNestedString);
  });
  test('INI-Nested', () => {
    expect(genDiff(filePathToBeforeNestedINI, filePathToAfterNestedINI))
      .toBe(expectedNestedString);
  });
  test('JSON-INI-Nested', () => {
    expect(genDiff(filePathToBeforeNestedINI, filePathToAfterNestedINI))
      .toBe(expectedNestedString);
  });
});


describe('Output in Plain format', () => {
  const expectedFlatInPlainString =
`Property 'timeout' was updated.From '50' to '20'
Property 'proxy' was removed
Property 'verbose' was added with value: true`;

  const expectedNestedInPlainString =
`Property 'common.setting2' was removed
Property 'common.setting6' was removed
Property 'common.setting4' was added with value: blah blah
Property 'common.setting5' was added with complex value
Property 'group1.baz' was updated.From 'bas' to 'bars'
Property 'group2' was removed
Property 'group3' was added with complex value`;

  test('Flat config in plain format', () => {
    expect(genDiff(filePathToBeforeJSON, filePathToAfterJSON, 'plain'))
      .toBe(expectedFlatInPlainString);
  });

  test('Nested config in plain format', () => {
    expect(genDiff(filePathToBeforeNestedJSON, filePathToAfterNestedJSON, 'plain'))
      .toBe(expectedNestedInPlainString);
  });
});

describe('Output in JSON format', () => {
  const filePathToExpectedJSON = '__tests__/fixtures/diffs.json';
  const expectedObject = JSON.parse(fs.readFileSync(filePathToExpectedJSON, 'utf8'));
  test('JSON to JSON-diff', () => {
    expect(genDiff(filePathToBeforeNestedJSON, filePathToAfterNestedJSON, 'json'))
      .toEqual(expectedObject);
  });
});

describe('Different types of values', () => {
  const expected =
`{
    common: {
        setting1: Value 1
      + setting2: 56
      - setting2: 5,6
        setting3: true
        setting6: {
            key: value
        }
    }
    group1: baz,bas
  + group2: abc,xvz
  - group2: {
        abc: 12345
    }
}`;
  test('JSONs with different types', () => {
    expect(genDiff(filePathToBeforeNestedDiffTypesJSON, filePathToAfterNestedDiffTypesJSON))
      .toBe(expected);
  });
});
