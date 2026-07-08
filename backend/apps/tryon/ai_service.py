import requests
import time
import os
from django.conf import settings
from io import BytesIO
from django.core.files.base import ContentFile


class AIService:
    """
    Virtual Try-On AI service
    Supports: Fashn.ai, Replicate (IDM-VTON, Kolors), Mock mode
    """

    def __init__(self):
        self.provider = getattr(settings, 'AI_PROVIDER', 'mock')
        self.replicate_token = getattr(settings, 'REPLICATE_API_TOKEN', '')
        self.fashn_key = getattr(settings, 'FASHN_API_KEY', '')

    def generate_tryon(self, customer_image_url, saree_image_url):
        """
        Main method — provider based routing
        Returns: {
            'success': True/False,
            'result_image_url': '...',  (if success)
            'result_image_file': ContentFile,  (if success)
            'processing_time': float,
            'provider': 'fashn/replicate/mock',
            'error': '...'  (if failed)
        }
        """
        print(f"\n{'='*50}")
        print(f"AI TryOn Request")
        print(f"Provider: {self.provider}")
        print(f"Customer: {customer_image_url}")
        print(f"Saree: {saree_image_url}")
        print(f"{'='*50}\n")

        start_time = time.time()

        try:
            if self.provider == 'fashn':
                result = self._fashn_tryon(
                    customer_image_url,
                    saree_image_url
                )
            elif self.provider == 'replicate':
                result = self._replicate_tryon(
                    customer_image_url,
                    saree_image_url
                )
            elif self.provider == 'replicate_kolors':
                result = self._replicate_kolors_tryon(
                    customer_image_url,
                    saree_image_url
                )
            else:
                result = self._mock_tryon(
                    customer_image_url,
                    saree_image_url
                )

            elapsed = time.time() - start_time
            result['processing_time'] = round(elapsed, 2)
            result['provider'] = self.provider

            print(f"AI Result: {'SUCCESS' if result['success'] else 'FAILED'}")
            print(f"Time: {elapsed:.2f}s")

            return result

        except Exception as e:
            elapsed = time.time() - start_time
            print(f"AI Error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'processing_time': round(elapsed, 2),
                'provider': self.provider
            }

    # ============================================
    # FASHN.AI
    # ============================================
    def _fashn_tryon(self, customer_url, saree_url):
        """
        Fashn.ai API use pannum
        Docs: https://docs.fashn.ai
        """
        headers = {
            'Authorization': f'Bearer {self.fashn_key}',
            'Content-Type': 'application/json'
        }

        # Step 1: Start prediction
        start_response = requests.post(
            'https://api.fashn.ai/v1/run',
            headers=headers,
            json={
                'model_image': customer_url,
                'garment_image': saree_url,
                'category': 'one-piece',
            },
            timeout=30
        )

        if start_response.status_code != 200:
            return {
                'success': False,
                'error': f'Fashn API error: {start_response.text}'
            }

        prediction_id = start_response.json().get('id')

        if not prediction_id:
            return {
                'success': False,
                'error': 'No prediction ID received from Fashn'
            }

        # Step 2: Poll for result
        return self._fashn_poll(prediction_id, headers)

    def _fashn_poll(self, prediction_id, headers):
        """
        Fashn result ready aagura varaikkum poll pannum
        """
        max_attempts = 90
        poll_interval = 2

        for attempt in range(max_attempts):
            time.sleep(poll_interval)

            response = requests.get(
                f'https://api.fashn.ai/v1/status/{prediction_id}',
                headers=headers,
                timeout=15
            )

            if response.status_code != 200:
                continue

            data = response.json()
            status_val = data.get('status', '')

            print(f"  Fashn poll {attempt + 1}: {status_val}")

            if status_val == 'completed':
                output = data.get('output', [])
                if output:
                    image_url = output[0] if isinstance(output, list) else output
                    image_file = self._download_result_image(image_url)

                    return {
                        'success': True,
                        'result_image_url': image_url,
                        'result_image_file': image_file
                    }
                return {
                    'success': False,
                    'error': 'Fashn completed but no output image'
                }

            if status_val == 'failed':
                return {
                    'success': False,
                    'error': data.get('error', 'Fashn processing failed')
                }

        return {
            'success': False,
            'error': 'Fashn timeout — processing took too long'
        }

    # ============================================
    # REPLICATE — IDM-VTON
    # ============================================
    def _replicate_tryon(self, customer_url, saree_url):
        """
        Replicate.com la IDM-VTON model use pannum
        """
        headers = {
            'Authorization': f'Token {self.replicate_token}',
            'Content-Type': 'application/json'
        }

        # Step 1: Start prediction
        start_response = requests.post(
            'https://api.replicate.com/v1/predictions',
            headers=headers,
            json={
                'version': 'c871bb9b046607b680449ecbae55fd8c6f4e5f32',
                'input': {
                    'human_img': customer_url,
                    'garm_img': saree_url,
                    'garment_des': 'traditional Indian saree with blouse',
                    'is_checked': True,
                    'is_checked_crop': False,
                    'denoise_steps': 30,
                    'seed': 42
                }
            },
            timeout=30
        )

        if start_response.status_code not in [200, 201]:
            return {
                'success': False,
                'error': f'Replicate API error: {start_response.text}'
            }

        prediction_id = start_response.json().get('id')

        if not prediction_id:
            return {
                'success': False,
                'error': 'No prediction ID from Replicate'
            }

        # Step 2: Poll
        return self._replicate_poll(prediction_id, headers)

    # ============================================
    # REPLICATE — KOLORS VTON
    # ============================================
    def _replicate_kolors_tryon(self, customer_url, saree_url):
        """
        Replicate la Kolors Virtual Try-On model use pannum
        """
        headers = {
            'Authorization': f'Token {self.replicate_token}',
            'Content-Type': 'application/json'
        }

        start_response = requests.post(
            'https://api.replicate.com/v1/predictions',
            headers=headers,
            json={
                'version': 'kolors-virtual-try-on',
                'input': {
                    'human_image': customer_url,
                    'garment_image': saree_url,
                }
            },
            timeout=30
        )

        if start_response.status_code not in [200, 201]:
            return {
                'success': False,
                'error': f'Replicate Kolors error: {start_response.text}'
            }

        prediction_id = start_response.json().get('id')

        if not prediction_id:
            return {
                'success': False,
                'error': 'No prediction ID'
            }

        return self._replicate_poll(prediction_id, headers)

    def _replicate_poll(self, prediction_id, headers):
        """
        Replicate result ready aagura varaikkum poll pannum
        """
        max_attempts = 120
        poll_interval = 2

        for attempt in range(max_attempts):
            time.sleep(poll_interval)

            response = requests.get(
                f'https://api.replicate.com/v1/predictions/{prediction_id}',
                headers=headers,
                timeout=15
            )

            if response.status_code != 200:
                continue

            data = response.json()
            status_val = data.get('status', '')

            print(f"  Replicate poll {attempt + 1}: {status_val}")

            if status_val == 'succeeded':
                output = data.get('output')

                if output:
                    image_url = output if isinstance(output, str) else output[0]
                    image_file = self._download_result_image(image_url)

                    return {
                        'success': True,
                        'result_image_url': image_url,
                        'result_image_file': image_file
                    }

                return {
                    'success': False,
                    'error': 'Replicate succeeded but no output'
                }

            if status_val == 'failed':
                return {
                    'success': False,
                    'error': data.get('error', 'Replicate processing failed')
                }

            if status_val == 'canceled':
                return {
                    'success': False,
                    'error': 'Prediction was canceled'
                }

        return {
            'success': False,
            'error': 'Replicate timeout'
        }

    # ============================================
    # MOCK MODE — Testing without real AI
    # ============================================
    def _mock_tryon(self, customer_url, saree_url):
        """
        Mock mode — AI illama testing panna
        Customer image ae return pannum result ah
        """
        print("  MOCK MODE: Simulating AI processing...")
        time.sleep(3)

        image_file = self._download_result_image(customer_url)

        return {
            'success': True,
            'result_image_url': customer_url,
            'result_image_file': image_file,
            'is_mock': True
        }

    # ============================================
    # HELPER — Download result image
    # ============================================
    def _download_result_image(self, url):
        """
        AI result image URL la irundhu download pannum
        Returns: Django ContentFile
        """
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            image_bytes = BytesIO(response.content)

            # Determine extension
            content_type = response.headers.get('content-type', 'image/png')
            ext = 'png' if 'png' in content_type else 'jpg'

            filename = f"tryon_result_{int(time.time())}.{ext}"

            return ContentFile(
                image_bytes.read(),
                name=filename
            )

        except Exception as e:
            print(f"  Image download error: {e}")
            return None


# Singleton instance
ai_service = AIService()