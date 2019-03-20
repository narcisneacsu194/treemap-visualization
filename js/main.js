let videoGameData;
let movieData;
let treemap;

d3.json("data/videogames.json", function (error, data) {
  if (error) throw error;
  convertChildValuesToNumbers(data);
  videoGameData = data;
  treemap = new Treemap();
});

d3.json('data/movies.json', function (error, data) {
  if (error) throw error;

  convertChildValuesToNumbers(data);

  movieData = data;
});

function convertChildValuesToNumbers(data) {
  data.children.forEach((d) => {
    d.children.forEach((d2) => {
      d2.value = +d2.value;
      return d2;
    });
  });
};