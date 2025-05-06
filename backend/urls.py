# In your project's main urls.py file
from django.contrib import admin
from django.urls import path, include
urlpatterns = [
    path('admin/', admin.site.urls),
    path('momentum/', include('core.urls')), # Change 'momentum.urls' to 'core.urls'
]