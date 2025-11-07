import json
import pika
from django.conf import settings
from django.core.management.base import BaseCommand
from inspection.services.infer import analyze_image

class Command(BaseCommand):
    help = "Servicio RPC para análisis de imágenes vehiculares"

    def handle(self, *args, **options):
        params = pika.URLParameters(settings.RABBITMQ_URL)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        ch.queue_declare(queue=settings.RPC_QUEUE, durable=True)
        ch.basic_qos(prefetch_count=1)

        self.stdout.write(self.style.SUCCESS(
            f"[VehicleInspection] Esperando mensajes en '{settings.RPC_QUEUE}'..."
        ))

        def on_request(ch, method, props, body):
            try:
                payload = json.loads(body)
                if isinstance(payload, dict):
                    if "imagenBase64" in payload:  # Formato directo
                        img_b64 = payload["imagenBase64"]
                    elif "data" in payload and "imagenBase64" in payload["data"]:  # Formato RPC de Nest
                        img_b64 = payload["data"]["imagenBase64"]
                    elif "payload" in payload and "imagenBase64" in payload["payload"]:
                        img_b64 = payload["payload"]["imagenBase64"]
                    else:
                        img_b64 = None
                else:
                    img_b64 = None
                result = analyze_image(img_b64)
                response = {"ok": True, "data": result}
            except Exception as e:
                response = {"ok": False, "error": str(e)}

            ch.basic_publish(
                exchange="",
                routing_key=props.reply_to,
                properties=pika.BasicProperties(correlation_id=props.correlation_id),
                body=json.dumps(response)
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)

        ch.basic_consume(queue=settings.RPC_QUEUE, on_message_callback=on_request)
        ch.start_consuming()
