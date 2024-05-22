# tqdm.me
A cross-platform app for visualizing TQDM progress bars in real-time.

## Heroku Deployment
We are using Heroku to deploy the app at https://tqdm.me.

### Configuration
The `runtime.txt` file specifies the Python version to use.

Our `Procfile` specifies to run `python src/server.py` to start the server.

### Initialization
Register the app on Heroku.
```
heroku git:remote -a tqdm-me
```

### Configuration
Ensure that the Python buildpack is used.
```
heroku buildpacks:add heroku/python
```

### Update
Ensure your `requirements.txt` file is up-to-date.
```
pip freeze > requirements.txt
```

### Publish
After committing your changes, push to Heroku.
```
git push heroku main
```

If you'd like to push a different branch, specify it.
```
git push heroku branch-name:main
```