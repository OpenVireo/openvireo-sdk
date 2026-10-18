{{- define "kpx-connect.name" -}}kpx-connect{{- end -}}
{{- define "kpx-connect.fullname" -}}{{ .Release.Name }}-kpx-connect{{- end -}}
{{- define "kpx-connect.labels" -}}
app.kubernetes.io/name: {{ include "kpx-connect.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}
{{- define "kpx-connect.selector" -}}
app.kubernetes.io/name: {{ include "kpx-connect.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
{{- define "kpx-connect.secret" -}}{{ .Values.existingSecret | default (include "kpx-connect.fullname" .) }}{{- end -}}
{{- define "kpx-connect.url" -}}http://{{ include "kpx-connect.fullname" . }}.{{ .Release.Namespace }}.svc.cluster.local:{{ .Values.service.port }}{{- end -}}
