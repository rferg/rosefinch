module.exports = (config) => {
    config.set({
      frameworks: [ 'jasmine', 'karma-typescript' ],
      plugins: [
        'karma-jasmine',
        'karma-chrome-launcher',
        'karma-typescript',
        'karma-spec-reporter'
      ],
      karmaTypescriptConfig: {
        tsconfig: './tsconfig.test.json',
        bundlerOptions: {
          transforms: [
            require('karma-typescript-es6-transform')({
              presets: [
                ['@babel/env', {
                  targets: {
                    browsers: ['last 2 Chrome versions']
                  }
               }]
              ]
             })
          ]
        }
      },
      client: {
        // leave Jasmine Spec Runner output visible in browser
        clearContext: false
      },
      files: [
        'test/setup.ts',
        { pattern: 'src/**/*.ts' },
        { pattern: 'test/**/*.spec.ts' }
      ],
      exclude: [ 'src/index.ts' ],
      preprocessors: {
        'test/setup.ts': [ 'karma-typescript' ],
        'src/**/*.ts': [ 'karma-typescript' ],
        'test/**/*.spec.ts': [ 'karma-typescript' ]
      },
      reporters: [ 'spec', 'karma-typescript' ],
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['ChromeHeadless']
    })
}