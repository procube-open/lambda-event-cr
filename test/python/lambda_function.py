import sys
def handler(event, context):
    return dict(
        message='Hello from AWS Lambda using Python' + sys.version + '!',
        event=event
    )
