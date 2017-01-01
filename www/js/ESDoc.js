var ESDoc = {
  post: function(data, callback) {
    const path = '/api/create';
    const xhr = new XMLHttpRequest();

    xhr.open('POST', path);
    xhr.onload = function(res) {
      // check response text
      const responseText = res.target.responseText;
      if (!responseText) {
        callback(new Error(), null);
        return;
      }

      // check status
      if (res.target.status !== 200) {
        callback(new Error('status is not 200'), res.target.responseText);
        return;
      }

      callback(null, res.target.responseText);
    };

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const temp = [];
    for (const key in data) {
      if (data[key]) temp.push(key + '=' + encodeURIComponent(data[key]));
    }
    const params = temp.join('&');

    xhr.send(params);
  },

  polling: function(url, timeout, callback) {
    const startTime = Date.now();

    setTimeout(function(){
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function(res) {
        if (res.target.status === 200){
          callback(null, res.target.responseText);
        } else {
          const endTime = Date.now();
          timeout = timeout - (endTime - startTime);
          if (timeout <= 0) {
            callback(new Error('timeout'));
          } else {
            ESDoc.polling(url, timeout, callback);
          }
        }
      };

      xhr.send();
    }, 1000);
  }
};

window.ESDoc = ESDoc;
