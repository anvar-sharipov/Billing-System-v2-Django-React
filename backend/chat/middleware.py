from urllib.parse import parse_qs
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.backends import TokenBackend
from asgiref.sync import sync_to_async
from channels.middleware import BaseMiddleware


class JwtAuthMiddleware(BaseMiddleware):
    """Middleware that takes a JWT token from the query string (?token=...) and
    populates scope['user'] with the authenticated user. If the token is invalid
    or missing, scope['user'] will be AnonymousUser.
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token_list = query_params.get("token")

        scope['user'] = AnonymousUser()

        if token_list:
            token = token_list[0]
            try:
                # Decode and validate token using SimpleJWT's TokenBackend
                token_backend = TokenBackend(
                    algorithm=getattr(settings, 'SIMPLE_JWT', {}).get('ALGORITHM', 'HS256'),
                    signing_key=settings.SECRET_KEY,
                )
                validated_data = token_backend.decode(token, verify=True)

                user_id = validated_data.get('user_id') or validated_data.get('user_id')
                if user_id is not None:
                    User = get_user_model()
                    try:
                        user = await sync_to_async(User.objects.get)(id=user_id)
                        scope['user'] = user
                    except User.DoesNotExist:
                        scope['user'] = AnonymousUser()
            except Exception:
                # Any error -> anonymous user
                scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
