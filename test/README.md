# Testing

This polyfill uses [WPT-style tests](https://github.com/web-platform-tests/wpt) (though just a bare implementation). The [constructor-submitter.html](constructor-submitter.html) test file is [copy-pasta'd from that repo](https://github.com/web-platform-tests/wpt/blob/544363de4568baf9ae90d71e4822661edc546650/xhr/formdata/constructor-submitter.html), the only modifications being 1. different resource paths, 2. it includes the polyfill, and 3. the test `<script>` also gets `type="module"` to defer it until after the polyfill loads.

Run `npm run test-server`, open up http://localhost:8080/test/constructor-submitter.html, and see how well it's working. Tests should pass on any browser[^1] that implements `FormData` even if it doesn't support the `submitter` parameter. You can also emulate an older browser by setting a `?emulate-no-submitter-support` query string; this will remove `submitter` support from the native `FormData` before applying the polyfill.

[^1]: The browser also needs to support JavaScript modules. Modules aren't required when using the polyfill if you're using a bundler. I'm just lazy when it comes to testing 😆
