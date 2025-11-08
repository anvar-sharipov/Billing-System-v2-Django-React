import os

# Set environment before anything that imports Django internals
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Инициализация Django (this will populate app registry)
django_application = get_asgi_application()

# Now it's safe to import code that depends on Django apps
# from chat.middleware import JwtAuthMiddleware
# from chat.routing import websocket_urlpatterns
# from chat.consumers import ChatConsumer

# application = ProtocolTypeRouter({
#     "http": django_application,
#     "websocket": JwtAuthMiddleware(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     ),
# })



# import os
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from django.core.asgi import get_asgi_application
# from chat import consumers
# from django.urls import path

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter([
#             path("ws/chat/", consumers.ChatConsumer.as_asgi()),
#         ])
#     ),
# })