{{- $swJS := resources.Get "js/sw.js" | resources.ExecuteAsTemplate "js/sw.js" . -}}
if (navigator.serviceWorker) {
  navigator.serviceWorker.register(
    "{{ $swJS.RelPermalink }}", 
    { scope: "{{ "/" | relURL }}" }
  );
}
