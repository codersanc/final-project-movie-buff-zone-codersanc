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
    $("div").last().prev().css("margin-bottom", "60px");
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

/* Adjusts the height of the ghost container backdrop */
function adjustTansparentBackdrop(){
	$("#ghost-container").height($("#main-container").outerHeight());
	$("#ghost-container").offset({top:$("#main-container").offset().top, left: 0});
}

/* Adjust heights of elements to equate them */
function adjustHeights(firstElement, secondElement){
	var firstElementHeight = firstElement.outerHeight(); // Getting the height of the first element
    var secondElementHeight = secondElement.outerHeight(); // Getting the height of the second elements
    if (firstElementHeight>secondElementHeight){ // Comparing heights and setting to the larger value
      secondElement.css("cssText", "height:" + firstElementHeight + "px !important"); 
    } else {
      firstElement.css("cssText", "height:" + secondElementHeight + "px !important"); 
    }
}

/* This function handles the headers of the compare cards (Sticks on scrolling below them) */
function stickyHeaders() {
  var win = $(window); // Window object
  var sticky = $(".sticky"); // Elements that need to be made sticky
  var pos = sticky.offset().top; // Current top offset
  win.on('scroll', function(){
  	if (win.scrollTop() >= pos) { // if scroll position is more than pos 
  		sticky.addClass("fixedPos"); // Adding sticky css class  
  		adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjust heights
  		$(".sticky").css("margin-left", "-14px"); // fixing position
  		$(".sticky").css("width", $(".mainCards").outerWidth()); // adjusting width
  	} else {
  		sticky.removeClass("fixedPos"); // Removing sticky css class
  		$(".sticky").css("margin-left", "0px"); // fixing position
  		$(".sticky").css("width", "auto"); // adjusting width
  		adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjust heights
  	}
  });
}

/* Actions to perform once document is ready */
$(document).ready(function(){

  /* Added window load animation */
  $("body").fadeIn(1000);
  
  /* Settibg nasthead image dimensions */
  $(".masthead-image").width($(".masthead").outerWidth());
  if($(window).width()<=600) {
  	//$(".masthead-image").height($("#masthead-content").outerHeight());
  } else {
  	$(".masthead-image").height($(".masthead").outerHeight());
  }

  /* Defining logo click action */
  $(".logo").click(function(){
    window.location.href = "index.html"; // Sending back home
  });

  /* if ghost container is found, adjust its position */
  if($("#ghost-container").length!=0){
  	adjustTansparentBackdrop();
  }

  /* Initializing the particle background on the home page */
  try {
    $('.particle').particleground({
        dotColor: '#2d3354',
        lineColor: '#2d3354',
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
  	var maxheight=0;
  	var currentHeight=0;
  	$(".mainCards .card").each(function(){ // Looping over all cast cards
  		currentHeight=$(this).outerHeight();
  		if(currentHeight > maxheight) // Finding the max height
  		maxheight = currentHeight;
  	});
  	$(".mainCards .card").css("cssText", "height:" + maxheight + "px !important"); // Setting all cards to max height 
    adjustHeights($(".first .mainCards > .header"), $(".second .mainCards > .header")); // Adjusting the header heights
    adjustHeights($(".first .genres"), $(".second .genres")); // Adjusting the genres heights
  }

  /* Binding the click of the scroll down button to take the user to the details section of the cards */
  $("#scroll-to-comparison").click(function(){
    this.blur(); // Removing focus from the clicked button
    $('html, body').animate({
      scrollTop: $(".mainCards").offset().top
    }, 500); // Animating the scroll to the details section of the cards
  });

  /* Binding the click of the scroll down button to take the user to the details of the movie */
  $("#scroll-to-details").click(function(){
    this.blur(); // Removing focus from the clicked button
    $('html, body').animate({
      scrollTop: $(".detailsRaisedRow").offset().top
    }, 500); // Animating the scroll to the details section of the cards
  });

  /* Compare page: Making sticky headers of cards */
  if($("#compare-page").length!=0)
  stickyHeaders();

  /* Binding compare / remove buttons to allow add to compare / remove from compare */
  $(".compare").click(function(e){
  	$(this).trigger("blur");
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
        $("div").last().prev().css("margin-bottom", "70px");
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

/* Showing the transulcent ghost container once the window is rendered  */
$(window).on('load', function(){
	$("#ghost-container").show();
	if($(this).width()<=600) { // Checking for mobile device
		$(".breadcrumb").removeClass("huge"); // Making breadcrumbs small if mobile device
	}
});

/* Resizing the ghost container if the window is resized */
$(window).resize(function() {
  if($("#ghost-container").length!=0)
  adjustTansparentBackdrop(); // adjusting backdrop ghost container on reseize
});