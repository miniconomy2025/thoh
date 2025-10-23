#!/usr/bin/env node

/**
 * Test Verification Script
 * 
 * This script helps verify that our test setup is working correctly.
 * Run with: node tests/verify-setup.js
 */

console.log('🧪 Verifying Test Setup...\n')

// Check if required files exist
const fs = require('fs')
const path = require('path')

const requiredFiles = [
  'vitest.config.ts',
  'tests/setup.ts',
  'tests/reflect-metadata-setup.ts',
  'tests/helpers/test-helpers.ts',
  'tests/mocks/repository-mocks.ts',
  'tests/setup-verification.test.ts',
  'tests/domain/shared/key-value-cache.test.ts',
  'tests/infrastructure/utils.test.ts',
  'tests/domain/simulation/simulation.entity.test.ts',
  'tests/domain/market/equipment.entity.test.ts',
  'tests/domain/population/person.entity.test.ts',
  'tests/application/user-cases/bank-use-cases.test.ts'
]

let allFilesExist = true

console.log('📁 Checking required test files:')
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file))
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allFilesExist = false
})

console.log('\n📦 Checking package.json scripts:')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredScripts = ['test', 'test:run', 'test:ui', 'test:coverage']
requiredScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script]
  console.log(`  ${exists ? '✅' : '❌'} ${script}`)
})

console.log('\n🎯 Summary:')
if (allFilesExist) {
  console.log('✅ All test files are present!')
  console.log('✅ Test setup appears to be complete!')
  console.log('\n🚀 You can now run: npm test')
} else {
  console.log('❌ Some test files are missing!')
  console.log('❌ Please check the file paths and try again.')
}

console.log('\n📋 Next steps:')
console.log('1. Run: npm test')
console.log('2. If tests pass, proceed to Step 2: Use Cases with Dependencies')
console.log('3. If tests fail, check the error messages and fix import paths')
