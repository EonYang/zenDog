var SortDogs = (obj) => {
  let sorted = []
  for (var i in obj) {
    if (obj[i].hasOwnProperty('duration')) {
      sorted.push(obj[i].duration);
    }
  }
  sorted.sort((a, b) => b - a);
  return sorted;
}

var durationStringify = (millis) => {
  let hours = Math.floor(millis / 3600000);
  let minutes = Math.floor(millis / 60000) - hours * 60;
  let seconds = ((millis % 60000) / 1000).toFixed(0);
  let hourText = hours > 0
    ? `${hours}:`
    : '';
  return hourText + minutes + ":" + (
    seconds < 10
    ? '0'
    : '') + seconds;
}

var getRank = () => {
$.ajax({
      url: "./api/top10",
      dataType: 'json',
      success: (data) => {
        let sortedKeys = SortDogs(data);
        console.log(sortedKeys);
        $('#ranks').empty();
        for (let k = 0; k < sortedKeys.length; k++) {
          let key = sortedKeys[k];
          for (let i = 0; i < data.length; i++) {
            if (data[i].duration === key) {
              let dura = durationStringify(data[i].duration);
              $('#ranks').append(`<li>   ${data[i].name}   :   ${dura} </li>`);
            }
          }
        }
      },
      error: () => {
        $('#ranks').append(`database error`);
      }
    });
  };
getRank();
setInterval(getRank, 5000);
