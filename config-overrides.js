const {
    addDecoratorsLegacy,
    override,
    addLessLoader,
    disableEsLint,
    fixBabelImports
} = require("customize-cra");

// module.exports = {
//     webpack: override(
//         addDecoratorsLegacy(),
//         disableEsLint(),
//         addLessLoader({
//             javascriptEnabled: true,
//             modifyVars: {
//                 '@primary-color': '#1DA57A',
//                 '@font-size-base': '14px',
//                 '@font-family': 'Arial'
//             },
//         }),
//     )
// };

module.exports = override(
    addDecoratorsLegacy(),
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            '@font-size-base': '16px',
        },
    }),
);
