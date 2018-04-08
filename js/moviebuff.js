/**
 * @file moviebuff.js
 * 
 * Provides functionality to the MBZ Website
 *
 * @author Sanchit Kumar
 * @version 1.0
 * 
 */

/* Global variable that holds items being compared */
var compareItems = [];

/* JQuery Plugin - FakeLoader Spinner */
$("#fakeLoader").fakeLoader({    
    timeToHide:500, //Time in milliseconds for fakeLoader disappear
    zIndex:99999, // Default zIndex
    spinner:"spinner1", //Options: 'spinner1', 'spinner2', 'spinner3', 'spinner4', 'spinner5', 'spinner6', 'spinner7' 
    bgColor:"#4C83FF" //Hex, RGB or RGBA colors
});

/**
 * Function to add a title to compare
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 * @param {[Object]} comparatorBar - JQuery object of the comparitor bar at the bottom of the screen
 */
function addToCompare(addToCompareButton, comparatorBar) {

  /* Changing the compare button to remove button */
  addToCompareButton.find("i").removeClass("plus").addClass("close");
  addToCompareButton.find(".visible").text("Remove");
  addToCompareButton.blur();

  /* Setting up JQuery UI animation options */
  var options = { to: "#comparator-bar", className: "ui-effects-transfer"};

  /* Finding the closest card element to the add to compare button & applying animation */
  addToCompareButton.closest(".card").effect("transfer", options, 500);

  /* Creating compare token in the compare bar */
  var token = createCompareToken(addToCompareButton, comparatorBar);

  /* Setting the title in cookie */
  setCompareCookie(addToCompareButton);

  /* Binding the 'x' icon on the token to remove it */
  token.find("i").click(function(){
    removeFromCompare(addToCompareButton, comparatorBar, token);
  });

  /* If 2 items have already been added for compare */
  if(comparatorBar.find("span").length == 2) {
    /* Enabling compare button on the comparitor bar */
    $("#comparator-bar button").removeClass("disabled");
    $(".compare").addClass("disabled"); /* Disable other buttons */
    /* Iterating over list of items added to compare */
    $.each(compareItems, function(index, value){
      /* To keep selected movie buttons enabled */
      $("div[data='" + value + "']").removeClass("disabled");
    });
  }
}

/**
 * This function sets the comparison title in the Cookie
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 */
function setCompareCookie(addToCompareButton){
  if(typeof Cookies === 'undefined')
  return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("title");
  /* Checking if cookie was stored or null */ 
  if (typeof cookieValue != 'undefined' && cookieValue!=null) {
    titles = cookieValue.split(","); // Splitting by comma
  }
  /* Adding the new title to the array */
  titles.push(addToCompareButton.attr("data"));
  /* Setting the cookie */
  Cookies.set('titles', JSON.stringify(titles), {
    expires:2
  });
}

/**
 * This function removes the comparison title from the Cookie
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 */
function removeCompareCookie(addToCompareButton) {
  if(typeof Cookies === 'undefined')
  return null;
  var titles = [];
  /* Fetching the Cookie */
  var cookieValue = Cookies.get("title");
  if (typeof cookieValue != 'undefined' && cookieValue!=null) {
    titles = cookieValue.split(","); // Splitting by comma
  }
  /* Checking at which index the title is */
  var index = $.inArray(addToCompareButton.attr("data"), titles);
  /* Removing the title from the array */
  if (index>=0) titles.splice(index, 1);
  /* Setting the new array in the cookie */
  Cookies.set('titles', JSON.stringify(titles), {
    expires:2
  });
}

/**
 * Function to remove a title from comparison
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare/remove button of the title card 
 * @param {[Object]} comparatorBar - JQuery object of the comparitor bar at the bottom of the screen
 * @param {[Object]} token - JQuery object token of the title added into the comparitor bar
 */
function removeFromCompare (addToCompareButton, comparatorBar, token) {
  addToCompareButton.find("i").addClass("plus").removeClass("close");
  addToCompareButton.find(".visible").text("Compare");
  addToCompareButton.blur();

  /* Disabling compare button on comparitor bar */
  $("#comparator-bar button").addClass("disabled");

  /* Removing item from compare Items array */
  var index = $.inArray(addToCompareButton.attr("data"), compareItems);
  if (index>=0) compareItems.splice(index, 1);

  /* Removing item from cookie */
  removeCompareCookie(addToCompareButton);

  /* Enabling all compare buttons as we are no longer at limit */
  $(".compare").removeClass("disabled");
  token.remove();

  /* If 2 items have already been added for compare */
  if(comparatorBar.find("span").length == 0) {
    comparatorBar.fadeOut("1000");
    $("div").last().prev().css("margin-bottom", "0px");
  }
}

/**
 * Function to create a compare token in the compare bar
 * 
 * @param {[Object]} addToCompareButton - JQuery object of the compare button that was clicked 
 * @param {[Object]} comparatorBar - JQuery object of the comparitor bar at the bottom of the screen
 * @return {[Object]} token - The crated JQuery object of token that was added to the comparitor bar
 */
function createCompareToken (addToCompareButton, comparatorBar) {
  /* Created token span */
  var token = $("<span class='ui label transition visible'></span>");

  /* Text Node to be inserted into the token span (Obtained from data attr of the add to compare button) */
  var tokenContent = addToCompareButton.attr("data");
  compareItems.push(tokenContent);

  /* Adding token content to the data attr */
  token.attr("data", tokenContent);

  /* Created token delete icon */
  var tokenIcon = $("<i class='delete icon'></i>");

  /* Appending newly created token elements */
  token.append(tokenContent).append(tokenIcon);
  comparatorBar.append(token);

  return token;
}

/* This function takes the user to the details page of the movie */
function showDetails() {
  window.location.href="details.html";
}

/* his function takes the user to the comparison page */
function comparisonPage(){
  window.location.href="compare.html";  
}

/* Actions to perform once document is ready */
$(document).ready(function(){

  /* Added window load animation */
  $("body").fadeIn(1000);
  
  /* Settibg nasthead image dimensions */
  $(".masthead-image").width($(".masthead").outerWidth());
  $(".masthead-image").height($(".masthead").outerHeight());

  /* Defining logo click action */
  $(".logo").click(function(){
    window.location.href = "index.html"; // Sending back home
  });

  /* Initializing the particle background on the home page */
  try {
    $('.particle').particleground({
        dotColor: '#d6f1ff',
        lineColor: '#d6f1ff',
        density: 15000
    });
  } catch (e) {
    // Meaning the particles js has not been loaded
  }  

  /* Code to toggle filter bar show / hide */
  $("#filters-toggle").click(function(){
    var controlsPanel = $("#filters-controls");

    /* Checking if the panel is visible */
    if(controlsPanel.is(":visible")){
      /* Hiding panel */
      controlsPanel.slideUp("1000");
    } else {
      /* Displaying Panel */
      controlsPanel.slideDown("1000");
    }
  });

  /* Binding the click of results cards - takes to details page */
  $(".card .primary").click(function(){
    showDetails();
  });

  /* Binding the click of compare titles button once movies have been selected */
  $("#compare-titles").click(function(){
    comparisonPage();
  });

  /* Creating popup for the rating icon */
  if($('.ratingIcon').length!=0)
  $('.ratingIcon').popup();

  /* Adjusting cast card height to match either column */
  if($('.first').length!=0) {
    var firstColumnCardHeight = $(".first .cast .card").height(); // Getting the height of the cards in the first column
    var secondColumnCardHeight = $(".second .cast .card").height(); // Getting the height of the cards in the second column
    if (firstColumnCardHeight>secondColumnCardHeight){ // Comparing heights and setting to the larger value
      $(".second .cast .card").height($(".first .cast .card").height()); 
    } else {
      $(".first .cast .card").height($(".second .cast .card").height());
    }
  }

  /* Binding compare / remove buttons to allow add to compare / remove from compare */
  $(".compare").click(function(){
    var comparatorBar = $("#comparator-bar");
    var movieTitle = $(this).attr("data");
    /* Initially disabling compare button on comparitor bar */
    $("#comparator-bar button").addClass("disabled");
    if(compareItems.indexOf(movieTitle)==-1) {
      /* Checking if the comparitor bar is not visible*/
      if(!comparatorBar.is(":visible")) {
        /* Displaying the compare bar */
        comparatorBar.fadeIn("1000");
        /* Adding margin to the bottom of the page and scrolling in case the compare bar overlaps */
        $("div").last().prev().css("margin-bottom", "50px");
        $('html, body').animate({scrollTop: '+=50px'}, 500);
        /* Adding title to compare */
        addToCompare($(this), comparatorBar);
      } else if (comparatorBar.find("span").length != 2) {
        /* Adding title to compare */
        addToCompare($(this), comparatorBar);
      }
    } else {
      /* Removing title from compare */
      removeFromCompare($(this), comparatorBar, $("span[data='" + movieTitle + "']"));
    }
  });
});