


import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // Purpose: Resolves the root entry file, index.js.
      // Filter: Matches the exact index.js file using a regular expression.
      // Action: Returns an object with the path set to 'index.js' and a custom namespace 'a'.
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      // Purpose: Resolves relative paths within a module. 
      // Filter: Matches relative paths (e.g., ./, ../) using a regular expression.
      // Action: Constructs a full URL based on the relative path and the directory of the currently resolved module. The resolveDir property helps form the correct URL.
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href,
        };
      });

      // Purpose: Resolves the main file of a module that is not handled by the previous loaders.
      // Filter: Matches any path that does not match the previous filters.
      // Action: Constructs a full URL to the module on unpkg using the module name provided in args.path.
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};


// The plugin first handles the root entry file index.js by assigning it a specific path and namespace.
// It then handles relative paths within modules by constructing the correct URL using the base directory of the currently resolved module.
// Finally, it resolves any other paths by constructing a URL directly to the unpkg CDN for the requested module.

