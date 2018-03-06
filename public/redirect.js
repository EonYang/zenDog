try {
  // This is the URL where mobile
  let mobileUrl = window.location.href.replace('https://', '') + 'mobile';
  console.log(mobileUrl)
  detectmobile.defaultMobileURL = mobileUrl;
  detectmobile.process();
} catch (e) {
  console.log(e);
  // Make sure that in the fault modes
  // we do not interrupt execution of other Javascript code
}
