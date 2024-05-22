# tqdm.me
A cross-platform app for visualizing TQDM progress bars in real-time.

## Heroku Deployment
We are using Heroku to deploy the app at https://tqdm.me.

### Configuration
The `requirements.txt` file was generated using `pip freeze > requirements.txt`.

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

### Publish
Push the code to Heroku.
```
git push heroku main
```