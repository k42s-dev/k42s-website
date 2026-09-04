(function(){
  const body = document.getElementById('termBody');
  let history = [];
  let historyIdx = -1;
  let pendingRequest = null; // stores last "request" text awaiting an email

  const COMMANDS = {
    help(){
      return [
        ['out', 'Available commands:'],
        ['out', '  <b>about</b>              what k42s is'],
        ['out', '  <b>services</b>           what k42s can fix for you'],
        ['out', '  <b>pricing</b>            how engagements are structured'],
        ['out', '  <b>request "&lt;text&gt;"</b>    describe what you need help with'],
        ['out', '  <b>email &lt;address&gt;</b>     send your request, once you have made one'],
        ['out', '  <b>contact</b>            other ways to reach k42s'],
        ['out', '  <b>clear</b>              clear the screen'],
      ];
    },
    about(){
      return [
        ['out accent', 'k42s helps teams get Kubernetes, CI/CD and automation into shape —'],
        ['out accent', 'without hiring a full-time engineer for it.'],
        ['out', 'Focused project work or light retainers, 4–8 hours a week.'],
      ];
    },
    services(){
      return [
        ['out accent', '<b>kubernetes</b>   Helm, best practices, hardening, GitOps'],
        ['out accent', '<b>ci-cd</b>         GitHub Actions, GitLab CI, Azure DevOps'],
        ['out accent', '<b>automation</b>    Ansible & Terraform'],
      ];
    },
    pricing(){
      return [
        ['out', 'Two shapes, both scoped to weekly hours rather than headcount:'],
        ['out accent', '  <b>project</b>   a fixed piece of work, quoted up front'],
        ['out accent', '  <b>retainer</b>  4–8 hrs/week, billed monthly, cancel any time'],
        ['out', 'Run <b style="color:var(--orange)">request "..."</b> with what you need and you will get an actual number back.'],
      ];
    },
    contact(){
      return [
        ['out', 'Fastest path: run <b style="color:var(--orange)">request "&lt;what you need&gt;"</b> below.'],
        ['out', 'Or reach out directly — hello@k42s.dev'],
      ];
    },
    whoami(){
      return [['out', 'guest — but tell me what you are trying to fix and that changes fast.']];
    },
    ls(){
      return [['out', 'services   pricing   contact   about   request']];
    },
    sudo(){
      return [['out err', 'guest is not in the sudoers file. this incident will be reported to nobody.']];
    },
  };

  function render(){
    body.innerHTML = '';

    // static header, like the reference screenshot
    const meta = document.createElement('div');
    meta.className = 'line meta-line';
    meta.innerHTML = '<span class="icon">◇</span> k42s   <span class="user">guest</span>@<span class="host">k42s</span>   <span class="path">~</span>';
    body.appendChild(meta);

    history.forEach(entry => {
      const cmdLine = document.createElement('div');
      cmdLine.className = 'line cmd-line';
      cmdLine.innerHTML = '<span class="arrow">→</span>' + escapeHtml(entry.cmd);
      body.appendChild(cmdLine);

      entry.output.forEach(([cls, text]) => {
        const o = document.createElement('div');
        o.className = 'line ' + cls;
        o.innerHTML = text;
        body.appendChild(o);
      });
    });

    // live prompt
    const row = document.createElement('div');
    row.className = 'prompt-row';
    row.innerHTML = '<span class="arrow">→</span><input id="liveInput" class="prompt-input" autocomplete="off" spellcheck="false"><span class="cursor"></span>';
    body.appendChild(row);

    body.scrollTop = body.scrollHeight;
    const input = document.getElementById('liveInput');
    input.focus();
    input.addEventListener('keydown', onKeyDown);
  }

  function escapeHtml(str){
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function onKeyDown(e){
    const input = e.target;
    if(e.key === 'Enter'){
      const raw = input.value.trim();
      if(raw.length === 0) return;
      history.push({cmd: raw, output: []});
      historyIdx = history.length;
      runCommand(raw);
      render();
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      if(historyIdx > 0){ historyIdx--; input.value = history[historyIdx].cmd; }
    } else if(e.key === 'ArrowDown'){
      e.preventDefault();
      if(historyIdx < history.length - 1){ historyIdx++; input.value = history[historyIdx].cmd; }
      else { historyIdx = history.length; input.value=''; }
    }
  }

  function runCommand(raw){
    const entry = history[history.length - 1];
    const [name, ...rest] = raw.split(' ');
    const argStr = rest.join(' ').trim();
    const cmd = name.toLowerCase();

    if(cmd === 'clear'){
      history = [];
      return;
    }

    if(cmd === 'request'){
      const match = argStr.match(/^"(.+)"$/) || argStr.match(/^'(.+)'$/);
      const text = match ? match[1] : argStr;
      if(!text){
        entry.output.push(['out err', 'usage: request "what you need help with"']);
        return;
      }
      pendingRequest = text;
      entry.output.push(['out ok', 'Got it. One more step —']);
      entry.output.push(['out', 'run <b style="color:var(--orange)">email you@company.com</b> to send this through.']);
      return;
    }

    if(cmd === 'email'){
      const addr = argStr;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!pendingRequest){
        entry.output.push(['out err', 'nothing to send yet — run request "..." first.']);
        return;
      }
      if(!emailRe.test(addr)){
        entry.output.push(['out err', 'that does not look like a valid address.']);
        return;
      }
      const subject = encodeURIComponent('New request via k42s.dev');
      const bodyText = encodeURIComponent(
        'Request: ' + pendingRequest + '\n\nFrom: ' + addr
      );
      window.location.href = 'mailto:hello@k42s.dev?subject=' + subject + '&body=' + bodyText;
      entry.output.push(['out ok', 'Opening your email client to send this to k42s...']);
      pendingRequest = null;
      return;
    }

    if(COMMANDS[cmd]){
      entry.output.push(...COMMANDS[cmd]());
      return;
    }

    entry.output.push(['out err', 'command not found: ' + cmd + ' — try <b style="color:var(--orange)">help</b>']);
  }

  body.addEventListener('click', () => {
    const el = document.getElementById('liveInput');
    if(el) el.focus();
  });

  render();
})();
