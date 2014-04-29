var CAPI_KEY = "funjs-reactive";

// Returns a Promise of the response
// See http://explorer.content.guardianapis.com/#/
// for API docs
function searchContentApi(query, limit) {
  return reqwest({
    url: 'http://content.guardianapis.com/search',
    type: 'jsonp',
    data: {
      'q':         query,
      'page-size': limit,
      'api-key':   CAPI_KEY,
      'show-fields': 'headline'
    }
  });
}


/* TODO: Instructions / Ideas:
 *
 * 1. Show the current query in the UI ('.q-display')
 * 2. Filter out queries of two characters or less
 * 3. Throttle the query to run at most once a second
 * 4. Run the query against the Content API (see helper function
 *    above)
 * 5. Display matched headlines in the 'results' list, as links to the
 *    original article
 * 6. Use 'limit' dropdown to customize the number of results
 * 7. Highlight the query in the matched headlines (if found)
 * 8. Allow disabling find-as-you-type behaviour using checkbox;
 *    if disabled, only search when the Search button is pressed
 * 9. Update the URL of the page to include ?q=<query> as the user
 *    updates the query
 */

var qEl = document.querySelector(".q");
var q = Bacon.fromEventTarget(qEl, "input");

var lEl = document.querySelector(".limit");
var l = Bacon.fromEventTarget(lEl, "input");

var selectStream = l.map(function(e) {
  return e.target.value;
})
.toProperty(5);

var inputStream = q.map(function(e) {
  return e.target.value;
}).filter(function(v) {
  return v.length > 2;
})
.throttle(200);

var combineTemp = Bacon.combineTemplate({
  input: inputStream,
  select: selectStream
})
.flatMap(function(t) {
  return Bacon.fromPromise(searchContentApi(t.input, t.select));
})
.map(function(result) {
  return result.response.results;
})
.map(function(results) {
  return results.map(function(result) {
    return "<li><a href='" + result.webUrl + "'>" + result.webTitle + "</a></li>";
  });
})
.onValue(function(results) {
  document.querySelector('.results').innerHTML = results.join(' ');
});

q.onValue(function(e) {
  document.querySelector('.q-display').innerHTML = e.target.value;
});
