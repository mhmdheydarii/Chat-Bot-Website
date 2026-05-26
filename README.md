<section style="max-width:700px; margin:auto; font-family:Arial, sans-serif; line-height:1.7; color:#333;">
  <h1 style="text-align:center; color:#2c3e50;">Django Ai Chat</h1>

  <p align="center">
  <img src="./docs/django.png" width="700"/>
  </p>
</section>

<h2>⚙️ Installation (Windows)</h2>

<p>Follow these steps to set up and run the project locally.</p>

<hr>

<h3>1. Clone the repository</h3>

```bash
git clone https://github.com/mhmdheydarii/Chat-Bot-Website.git
```

<br>

<h3>2. Navigate to the project directory</h3>

```bash
cd Chat-Bot-Website
```

<br>

<h3>3. Create a virtual environment</h3>

```bash
python -m venv .venv
```

<br>

<h3>4. Activate the virtual environment</h3>

<p><b>CMD</b></p>

```cmd
.venv\Scripts\activate
```

<p><b>PowerShell</b></p>

```powershell
.\.venv\Scripts\Activate.ps1
```

<p>
After activation, you should see something similar to:
</p>

```bash
(.venv)
```

<p>
at the beginning of your terminal line.
</p>

<br>

<h3>5. Install dependencies</h3>

<p>If the project includes a <code>requirements.txt</code> file:</p>

```bash
pip install -r requirements.txt
```

<br>

<h3>6. Run the project</h3>


```bash
python manage.py makemigrations
```
```bash
python manage.py migrate
```
```bash
python manage.py runserver
```

<hr>

<details>
<summary><b>❌ Deactivate Virtual Environment</b></summary>

<br>

To exit the virtual environment:

```bash
deactivate
```

</details>

<br>

<p align="center">
⭐ If you found this project useful, consider giving it a star.
</p>
