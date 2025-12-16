import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    server: {
      host: true,
      allowedHosts: [
        'freeyemenis.org',
        'www.freeyemenis.org',
        'localhost',
      ],
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};
