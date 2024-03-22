"use strict";



window.ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";

const App_ID = "d099883b";
const API_KEY = "38f35861a326a06d9f3769bb97dc3ce2";
const TYPE = "public";
//queries --> query array 
//successCallback -->function 
export const fetchData = async function (queries, successCallback) {
    const query = queries?.join("&")
        .replace(/,/g, "=")
        .replace(/ /g, "20%")
        .replace(/\+/g, "%2B");

    const url = `${ACCESS_POINT}?app_id=${App_ID}&app_key=${API_KEY}&type=${TYPE}${query ? `&${query}` : ""}`;

    //Response
    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        successCallback(data);
    }
}