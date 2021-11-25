{{/*
Expand the name of the chart.
*/}}
{{- define "debio-backend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "debio-backend.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "debio-backend.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "debio-backend.labels" -}}
helm.sh/chart: {{ include "debio-backend.chart" . }}
{{ include "debio-backend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "debio-backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "debio-backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "debio-backend.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "debio-backend.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of postgres secret.
*/}}
{{- define "debio-backend.postgresSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "postgres" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of postgres secret.
*/}}
{{- define "debio-backend.dbCitySecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "dbcity" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of dbLocations secret.
*/}}
{{- define "debio-backend.dbLocationsSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "dblocations" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of escrow Substrate Mnemonic secret.
*/}}
{{- define "debio-backend.adminSubstrateMnemonicSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "admin-substrate-mnemonic" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of sudo debioEscrowPrivateKey secret.
*/}}
{{- define "debio-backend.debioEscrowPrivateKeySecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "debio-escrow-private-key" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of sudo escrowContractAddress secret.
*/}}
{{- define "debio-backend.escrowContractAddressSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "escrow-contract-address" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of coinmarketcap Api Key secret.
*/}}
{{- define "debio-backend.coinmarketcapApiKeySecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "coinmarketcap-api-key" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of recaptchaSecretKey secret.
*/}}
{{- define "debio-backend.recaptchaSecretKeySecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "recaptcha-secret-key" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of debioApiKey secret.
*/}}
{{- define "debio-backend.debioApiKeySecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "debio-api-key" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of elastic.node secret.
*/}}
{{- define "debio-backend.elasticNodeSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "elastic-node" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of elastic.username secret.
*/}}
{{- define "debio-backend.elasticUsernameSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "elastic-username" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of elastic.password secret.
*/}}
{{- define "debio-backend.elasticPasswordSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "elastic-password" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of email secret.
*/}}
{{- define "debio-backend.emailSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "email" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of bucketname secret.
*/}}
{{- define "debio-backend.bucketnameSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "bucketname" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of storageBaseURI secret.
*/}}
{{- define "debio-backend.storageBaseURISecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "storage-base-uri" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the name of serviceAccountBase64 secret.
*/}}
{{- define "debio-backend.serviceAccountSecretName" -}}
{{- printf "%s-%s" (include "debio-backend.fullname" .) "service-account" | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}
