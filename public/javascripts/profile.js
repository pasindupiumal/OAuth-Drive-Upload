$(document).ready(function() {

    const url = new URL(window.location.href);
    const action = url.searchParams.get("action");

    if(action === 'login'){

        toastr.success('Login Successful');
    }
    else if(action === 'upload'){

        const status = url.searchParams.get("status");
        
        if(status === 'true'){
            toastr.success('File Uploaded Successfully');
        }
        else{
            toastr.error('Error Occured While Uploading File');
        }
        
    }
    else if(action === 'delete'){
        
        toastr.success('File Removed Successfully');
    }
    

});

function deleteButtonClick(fileID) {

    $.post('/auth/delete', {fileID: fileID}).then(data => {

        window.location.href = 'http://localhost:3000/profile?action=delete';

    }).catch(error => {

        toastr.error('Error Deleting Selected Item');
        console.log('Error deleting selected item - ' + error);
    });

}

