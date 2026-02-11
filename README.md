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
- Add payment system
    - All users will have a balance
        - They can increase the balance by either cashing in through add balance
        - Or through selling notes to other users.
    - When someone tries to purchase something, they pay from their account balance
    - If they don't have enough balance, they are shown a modal saying not enough balance and a button "Add Funds"
    - The add funds button will redirect them to the add balance page.
