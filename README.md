# Notes Bechakena App

## Todo
- make sure the user cannot abuse the upload by uploading random files
    - only allow .pdf files
    - set max file size to 50mb
    - Set limit to 5 pending uploads
        - meaning a user cannot have more than 5 uploaded files as pending
        - If the user tries to upload more than 5 as pending, show error
        - each user will have a personal upload limit.
        - the default is 5
    - When a file is rejected, delete it from r2 bucket
    - The admin can delete any already approved file from the site through the admin dashboard
