import requests

def get_monthly_report(url):
    response = requests.get(url, stream=True)
    save_path = url.split("/")[-1]
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=1024):
                f.write(chunk)
        print(f"PDF saved as {save_path}")
    else:
        print("Failed to download. Status:", response.status_code)

    return save_path


url = "https://members.gvrealtors.ca/news/GVR-Stats-Package-November-2025.pdf"
save_as = "pdfs/november_report.pdf"
