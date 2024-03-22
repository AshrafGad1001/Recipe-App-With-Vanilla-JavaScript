"use strict";
// Importing necessary modules
import { fetchData } from "./api.js";
import { $skeletonCard, cardQueries } from "./global.js";
import { getTime } from "./module.js";

/**
 * Accordion
 */
const $accordions = document.querySelectorAll("[data-accordion]");

const initAccordion = function ($element) {


    const $button = $element.querySelector("[data-accordion-btn]");
    let isExpanded = false;

    $button.addEventListener("click", function () {
        isExpanded = isExpanded ? false : true;
        this.setAttribute("aria-expanded", isExpanded);
    })
}
for (const $accordion of $accordions) {
    initAccordion($accordion);
}




/**
 * filter bar for Toggle For Mobile Screen
 */
//Node Element
const $filterBar = document.querySelector("[data-filter-bar]");
//Node List
const $filterTogglers = document.querySelectorAll("[data-filter-toggler]");
//Node Element
const $overlay = document.querySelector("[data-overlay]");


addEventOnElements($filterTogglers, "click", function () {
    $filterBar.classList.toggle("active");
    $overlay.classList.toggle("active");

    const bodyOverFlow = document.body.style.overflow;
    document.body.style.overflow = bodyOverFlow == "hidden" ? "visible" : "hidden";

});


/**
 * filter Submit And Clear
 */

// Node Elements
const $filterSubmit = document.querySelector("[data-filter-submit]");
const $filterClear = document.querySelector("[data-filter-clear]");
const $filterSearch = $filterBar.querySelector("input[name='search']");

$filterSubmit.addEventListener("click", function () {
    const $filterCheckboxes = $filterBar.querySelectorAll("input:checked");

    const queries = [];

    if ($filterSearch.value) {
        queries.push(["q", $filterSearch.value])
    }
    if ($filterCheckboxes.length) {
        for (const $checkbox of $filterCheckboxes) {
            const key = $checkbox.parentElement.parentElement.dataset.filter;
            queries.push([key, $checkbox.value]);
        }
    }

    window.location = queries.length ? `?${queries.join("&").replace(/,/g, "=")}` : "/recipes.html";
});
$filterSearch.addEventListener("keydown", e => {
    if (e.key == "Enter") {
        $filterSubmit.click();
    }
});

$filterClear.addEventListener("click", function () {
    const $filterCheckboxes = $filterBar.querySelectorAll("input:checked");

    $filterCheckboxes?.forEach(e => e.checked = false);
    $filterSearch.value &&= "";
});

const queryStr = window.location.search.slice(1);
const queries = queryStr && queryStr.split("&").map(i => i.split("="));


const $filterCount = document.querySelector("[data-filter-count]");
if (queries.length) {
    $filterCount.style.display = "block";
    $filterCount.innerHTML = queries.length;
} else {
    $filterCount.style.display = "none";
}

queryStr && queryStr.split("&").map(i => {
    if (i.split("=")[0] == 'q') {
        $filterBar.querySelector("input[type = 'search']").value = i.split("=")[1].replace(/%20/g, " ");
    } else {
        $filterBar.querySelector(`[value="${i.split("=")[1].replace(/%20/g, " ")}"]`).checked = true;

    }
});



/**
 * Node Element
 */
const $filterBtn = document.querySelector("[data-filter-btn]");

window.addEventListener("scroll", e => {
    $filterBtn.classList[window.scrollY >= 120 ? "add" : "remove"]("active");
});

/**
 * Request Recipes and Render
 */


const $gridList = document.querySelector("[data-grid-list]");
const $loadMore = document.querySelector("[data-load-more]");


const defaultQueries = [
    ["mealType", "breakfast"],
    ["mealType", "dinner"],
    ["mealType", "lunch"],
    ["mealType", "snack"],
    ["mealType", "teatime"],
    ...cardQueries
];
$gridList.innerHTML = $skeletonCard.repeat(20);
let nextPageUrl = "";

const renderRecipe = data => {
    data.hits.map((item, index) => {
        const {
            recipe: {
                image,
                label: title,
                totalTime: cookingTime,
                uri
            }
        } = item;

        const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
        const isSaved = window.localStorage.getItem(`cookio-recipe${recipeId}`);

        //Node Element
        const $card = document.createElement("div");
        $card.classList.add("card");
        $card.style.animationDelay = `${100 * index}ms`;


        $card.innerHTML = `
                    <figure class="card-media img-holder">
                        <img src="${image}" width="195" height="195" loading="lazy" class="img-cover" alt="${title}" />
                    </figure>

                    <div class="card-body">
                        <h3 class="title-small">
                        <a href="/detail.html?recipe=${recipeId}" class="card-link">${title ?? "Untitled"}</a>
                        </h3>

                        <div class="meta-wrapper">
                            <div class="meta-item">
                                <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                                <span class="label-medium">${getTime(cookingTime).time || "<1"}${getTime(cookingTime).timeUnit}</span>

                            </div>
                                    <button class="icon-btn has-state ${isSaved ? "saved" : "removed"}" aria-label="Add to saved-recipes"   onclick="saveRecipe(this,'${recipeId}')" >
                                        <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>

                                        <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                                    </button>
                            </div>
                    </div>
            `;
        $gridList.appendChild($card);
    });
};

let requestBefore = true;
fetchData(queries || defaultQueries, data => {
    const { _links: { next } } = data;
    nextPageUrl = next?.href;

    $gridList.innerHTML = "";
    requestBefore = false;

    if (data.hits.length) {
        renderRecipe(data);
    }
    else {
        $loadMore.innerHTML = `<p class="body-medium info-text">No Recipe Fount</p>`;
    }

});



const Container_Max_width = 1200;
const Container_Max_Card = 18;

window.addEventListener("scroll", async e => {
    if ($loadMore.getBoundingClientRect().top < window.innerHeight && !requestBefore && nextPageUrl) {
        $loadMore.innerHTML = $skeletonCard.repeat(Math.round(($loadMore.clientWidth) / (Container_Max_width)) * Container_Max_Card);
        requestBefore = true;

        const response = await fetch(nextPageUrl);
        const data = await response.json();

        const { _links: { next } } = data;
        nextPageUrl = next?.href;

        renderRecipe(data);
        $loadMore.innerHTML = "";
        requestBefore = false;
    }
    if (!nextPageUrl) {
        $loadMore.innerHTML = `<p class="body-medium info-text">No More Recipe</p>`;
    }
});