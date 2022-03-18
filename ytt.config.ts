import { defineConfig } from 'yapi-to-typescript'

export default defineConfig([
  {
    serverUrl: 'http://{yapihost}',
    typesOnly: false,
    target: 'typescript',
    reactHooks: {
      enabled: false,
    },
    prodEnvName: 'production',
    outputFilePath: 'src/api/index.ts',
    requestFunctionFilePath: 'src/api/request.ts',
    dataKey: 'object',
    projects: [
      {
        token: '{token}',
        categories: [
          {
            // id: [0, 1, -2], 0为全部；正整数为加对应分组；负整数为减对应分组
            id: [0],
            getRequestFunctionName(interfaceInfo, changeCase) {
              return changeCase.camelCase(interfaceInfo.parsedPath.name)
            },
          },
        ],
      },
    ],
  },
])
