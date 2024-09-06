import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache',
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      //Purpose: Loads the initial input code for index.js directly.
      //Filter: Matches the index.js file
      //Action: Returns the input code as JSX content.
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: inputCode,
        };
      });

      //Purpose: Checks if the requested file is already cached.
      //Filter: Matches any file
      //Action: Returns the cached result if available, otherwise continues to the next handler.
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cachedResult) {
          return cachedResult;
        }
      });

      // Purpose: Loads and processes CSS files.
      // Filter: Matches .css files.
      // Action: Fetches the CSS file, processes it to be injected into the document as a <style> element, caches the result, and returns the processed content.
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);
        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
        `;

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);

        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};


// The plugin first checks if the requested file (index.js) is the initial input and directly returns it.
// It then checks if the requested file is cached and returns the cached version if available.
// For CSS files, it fetches the content, processes it into a <style> element, and caches the result.
// For any other file types, it fetches the content, caches it, and returns the raw content.
// By caching the fetched files, this plugin significantly reduces the need for repeated network requests, improving the performance and efficiency of the bundling process.\
