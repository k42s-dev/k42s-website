(function(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    [form.name, form.email, form.message].forEach(f => f.classList.add('touched'));

    if(!name || !email || !message){
      setStatus('err', 'Please fill in every field.');
      return;
    }
    if(!emailRe.test(email)){
      setStatus('err', 'That email address does not look right.');
      return;
    }

    const subject = encodeURIComponent('New request via k42s.dev');
    const body = encodeURIComponent(
      'Request: ' + message + '\n\nFrom: ' + name + ' <' + email + '>'
    );

    window.location.href = 'mailto:hello@k42s.dev?subject=' + subject + '&body=' + body;
    setStatus('ok', 'Opening your email client to send this to k42s...');
  });

  function setStatus(type, text){
    status.textContent = text;
    status.className = 'form-status ' + type;
  }
})();
