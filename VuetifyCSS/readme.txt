When we update vuetify the app becomes TOO dark in dark mode.
I couldn't get their 'override' stuff to work.

I had a backup and found that these two files (specifically the .min.css) fixed the problem.
After an update, replace files in C:\Source\CenPoint\cplite\node_modules\vuetify\dist