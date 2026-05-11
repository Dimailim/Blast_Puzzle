/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/logic_tests/*.test.ts'],
	moduleFileExtensions: ['ts', 'js'],
};