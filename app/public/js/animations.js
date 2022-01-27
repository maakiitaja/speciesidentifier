var insectIdentifierAnimations = angular.module("insectIdentifierAnimations", [
  "ngAnimate",
]);

insectIdentifierAnimations.animation(".phone", function () {
  var animateUp = function (element, className, done) {
    console.log("animate up,element: " + element);
    if (className != "active") {
      console.log("animate up: classname not active");
      return;
    }
    element.css({
      position: "relative",
      top: 500,
      left: 0,
      //display: 'block'
    });

    jQuery(element).animate(
      {
        top: 0,
      },
      done
    );

    return function (cancel) {
      if (cancel) {
        element.stop();
      }
    };
  };

  var animateDown = function (element, className, done) {
    console.log("animate down, element: " + element);
    if (className != "active") {
      console.log("animate down: classname != active");
      return;
    }
    element.css({
      position: "relative",
      left: 0,
      top: 0,
    });

    jQuery(element).animate(
      {
        top: -500,
      },
      done
    );

    return function (cancel) {
      if (cancel) {
        element.stop();
      }
    };
  };

  return {
    addClass: animateUp,
    removeClass: animateDown,
  };
});
