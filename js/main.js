let videoGameData;
let treemap;

d3.json("data/videogames.json", function(error, data) {
  if (error) throw error;
    videoGameData = data;
    treemap = new Treemap();
  });