{{- define "openvireo-connect.name" -}}openvireo-connect{{- end -}}
{{- define "openvireo-connect.fullname" -}}{{ .Release.Name }}-openvireo-connect{{- end -}}
{{- define "openvireo-connect.labels" -}}
app.kubernetes.io/name: {{ include "openvireo-connect.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}
{{- define "openvireo-connect.selector" -}}
app.kubernetes.io/name: {{ include "openvireo-connect.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
{{- define "openvireo-connect.secret" -}}{{ .Values.existingSecret | default (include "openvireo-connect.fullname" .) }}{{- end -}}
{{- define "openvireo-connect.url" -}}http://{{ include "openvireo-connect.fullname" . }}.{{ .Release.Namespace }}.svc.cluster.local:{{ .Values.service.port }}{{- end -}}
