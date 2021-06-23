let db;
const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_item', { autoIncrement: true });
};

// success 
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
      uploadTransaction();
    }
  };
  
request.onerror = function(event) {
console.log(event.target.errorCode);
};


function saveRecord(record) { 
    const transaction = db.transaction(['new_item'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_item');

    budgetObjectStore.add(record);
};


function uploadTransaction() {
    const transaction = db.transaction(['new_item'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_item');
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['new_item'], 'readwrite');
          const budgetObjectStore = transaction.objectStore('new_item');
          budgetObjectStore.clear();

          alert('All saved transactions has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);