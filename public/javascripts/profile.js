$(document).ready(function() {

    const url = new URL(window.location.href);
    const action = url.searchParams.get("action");

    if(action === 'login'){

        toastr.success('Login Successful');
    }
    else if(action === 'upload'){
        
        toastr.success('File Uploaded Successful');
    }
    else if(action === 'delete'){
        
        toastr.success('File Removed Successful');
    }
    

});

function deleteButtonClick(fileID) {

    console.log('Hello, World - ' + fileID);

    $.post('/auth/delete', {fileID: fileID}).then(data => {

        window.location.href = 'http://localhost:3000/profile?action=delete';

    }).catch(error => {

        toastr.error('Error Deleting Selected Item');
        console.log('Error deleting selected item - ' + error);
    });

}

