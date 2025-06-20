// Change header logo on scroll
(function ($) {
  "use strict";

  $(window).on("scroll", function () {
    const header = $("header.theme-main-menu");
    const logoImg = $(".logo-img");

    if ($(this).scrollTop() > 10) {
      header.addClass("fixed");
      logoImg.attr("src", "images/es/ESHL-RES-LOGO-WHITE.png"); // white version
      logoImg.height(50); // adjust height for fixed header
    } else {
      header.removeClass("fixed");
      logoImg.attr("src", "images/es/ESHL-RES-LOGO.png"); // dark version
      logoImg.height(45); // adjust height for fixed header
    }
  });
})(jQuery);
