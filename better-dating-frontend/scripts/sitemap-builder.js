require('@babel/register')({
	extends: './.babelrc',
});
const Sitemap = require('react-router-sitemap').default;
// FIXME DRY!!! https://github.com/kuflash/react-router-sitemap/issues/71#issuecomment-437269350
const Routes = require('./Routes.jsx').default;
const generateSitemap = (hostname, targetFile) => (
	new Sitemap(Routes)
		.build(hostname)
		.save(targetFile)
);
generateSitemap('https://xn--h1aheckdj9e.xn--j1amh', './build/sitemap.xml');
generateSitemap('https://xn--h1aheckdj9e.xn--p1acf', './build/sitemap-rus.xml');
