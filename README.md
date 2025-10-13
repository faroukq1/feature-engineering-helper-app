# 📊 TP : Développement d'une Interface Sécurisée et Traitement de Données

## 🎯 Rapport Technique Complet

**Projet** : Application Full-Stack de Feature Engineering  
**Date** : 13 Octobre 2025  
**Technologies** : Next.js, FastAPI, Python, TypeScript

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#-vue-densemble)
2. [Partie 1 : Authentification Sécurisée](#-partie-1--authentification-sécurisée)
3. [Partie 2 : Traitement de Données](#-partie-2--traitement-de-données)
4. [Architecture Technique](#️-architecture-technique)
5. [Installation](#-installation)
6. [Analyse de Sécurité](#-analyse-de-sécurité)
7. [Questions Réflexives](#-questions-réflexives)

---

## 🏗️ Vue d'Ensemble

### Architecture du Projet

```
feature-engineering-helper-app/
├── client/                 # Frontend Next.js + React + TypeScript
│   ├── app/(auth)/        # Système d'authentification
│   │   ├── login/         # Interface de connexion sécurisée
│   │   └── register/      # Interface d'inscription avec validation
│   └── app/dashboard/     # Application principale post-authentification
│       ├── operations/    # Prétraitement des données
│       ├── visualization/ # Visualisations graphiques
│       ├── fusion/        # Fusion de datasets
│       └── create/        # Upload de datasets
└── server/                # Backend FastAPI + Python
    ├── app/main.py        # API REST principale
    ├── app/utils.py       # Utilitaires de traitement de données
    └── database.db        # Base de données SQLite
```

### Stack Technique

**Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn/UI, Recharts  
**Backend**: FastAPI, Python 3.14, SQLAlchemy, Pandas, NumPy, Scikit-learn  
**Sécurité**: Argon2, Zod validation, CORS  
**Data Processing**: Pandas, NumPy, Scikit-learn

---

## 🔐 Partie 1 : Authentification Sécurisée

### 1.1 Système de Mots de Passe Haute Sécurité

#### ✅ Exigences Implémentées

| Critère TP | Implémentation | Fichier | Status |
|------------|----------------|---------|--------|
| **Longueur ≥ 8 caractères** | `.min(8)` | `registerSchema.ts` | ✔️ **VALIDÉ** |
| **Majuscules** | `(?=.*[A-Z])` | `registerSchema.ts` | ✔️ **VALIDÉ** |
| **Minuscules** | `(?=.*[a-z])` | `registerSchema.ts` | ✔️ **VALIDÉ** |
| **Chiffres** | `(?=.*\d)` | `registerSchema.ts` | ✔️ **VALIDÉ** |
| **Caractères spéciaux** | `(?=.*[!@#$%^&*])` | `registerSchema.ts` | ✔️ **VALIDÉ** |
| **Hachage sécurisé** | Argon2 | `utils.py` | ✔️ **VALIDÉ** |
| **3 tentatives max** | À implémenter | N/A | ⚠️ **TODO** |

#### Code de Validation (Frontend)

**Fichier**: `client/lib/schemas/registerSchema.ts`

```typescript
export const registerSchema = z.object({
  firstName: z.string().min(4),
  lastName: z.string().min(4),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
      message: "Must contain uppercase, lowercase, number, and special character"
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

#### Code de Hachage (Backend)

**Fichier**: `server/app/utils.py`

```python
from passlib.context import CryptContext

# Configuration Argon2 - Algorithme de hachage de dernière génération
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password avec Argon2"""
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérification du mot de passe contre le hash"""
    return pwd_context.verify(plain_password[:72], hashed_password)
```

**Pourquoi Argon2?**
- 🏆 Gagnant Password Hashing Competition 2015
- 🛡️ Résistant aux attaques GPU/ASIC
- ⚡ Plus sécurisé que bcrypt/PBKDF2

### 1.2 Interface Principale (Éléments Microsoft)

#### 🪟 Éléments d'Interface Implémentés

| Élément Microsoft | Implémentation | Fichier |
|-------------------|----------------|---------|
| 🎨 **Barre de titre** | Header avec logo + user info | `dashboard/layout.tsx` |
| 📱 **Barre de menu** | Sidebar navigation | `_components/SideBar.tsx` |
| 🔘 **Barre d'outils** | Icons Lucide | Composants dashboard |
| 🪟 **Boutons Windows** | Réduire/Agrandir/Fermer | Header actions |
| 📋 **Menus contextuels** | Dropdown menus | `ui/dropdown-menu.tsx` |

**Sections du Dashboard:**
- 📁 **Create Dataset**: Upload CSV/Excel
- ⚙️ **Operations**: Prétraitement
- 📊 **Visualization**: Graphiques interactifs
- 🔗 **Fusion**: Combinaison de datasets

---

## 📊 Partie 2 : Traitement de Données

### 2.1 Prétraitement Complet

**Fichier**: `server/app/utils.py`

#### 1. Normalisation (Min-Max Scaling)

**Formule**: `x_norm = (x - min) / (max - min)` → [0, 1]

```python
if getattr(config, "normalization", False):
    scaler = MinMaxScaler()
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
```

**Usage**: KNN, Neural Networks, Gradient Descent

#### 2. Standardisation (Z-score)

**Formule**: `x_std = (x - μ) / σ` → moyenne=0, écart-type=1

```python
if getattr(config, "standarization", False):
    scaler = StandardScaler()
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
```

**Usage**: SVM, PCA, Régression Logistique

#### 3. Gestion Données Manquantes

| Stratégie | Méthode | Justification |
|-----------|---------|---------------|
| **Suppression** | `dropna()` | < 5% données manquantes |
| **Moyenne** | `fillna(mean())` | Distribution normale |
| **Médiane** | `fillna(median())` | Présence d'outliers |
| **Mode** | `fillna(mode())` | Variables catégorielles |
| **Interpolation** | `interpolate()` | Séries temporelles |
| **Zéro** | `fillna(0)` | Absence = valeur nulle |

```python
def apply_fill_values(df, fill_values_config):
    # Moyenne
    if fill_values_config.get("mean", False):
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].mean())
    
    # Médiane
    if fill_values_config.get("median", False):
        for col in numeric_cols:
            df[col] = df[col].fillna(df[col].median())
    
    # Mode (catégories + numériques)
    if fill_values_config.get("mode", False):
        for col in all_cols:
            mode_val = df[col].mode()
            if not mode_val.empty:
                df[col] = df[col].fillna(mode_val[0])
    
    return df
```

#### 4. Suppression Doublons

```python
before = len(df)
df = df.drop_duplicates()
print(f"✅ {before - len(df)} duplicates removed")
```

#### 5. Détection Intelligente des ID

```python
def get_id_columns(df):
    """Détection automatique des colonnes ID à exclure"""
    id_patterns = ['id', 'ID', 'uuid', 'key', 'index', 'identifier']
    id_columns = []
    
    for col in df.columns:
        # Détection par nom
        if any(p.lower() in str(col).lower() for p in id_patterns):
            id_columns.append(col)
        # Détection par unicité (100% valeurs uniques)
        elif df[col].nunique() == len(df) and len(df) > 1:
            id_columns.append(col)
    
    return id_columns
```

### 2.2 Visualisations

#### Types de Graphiques

- 📊 **Histogrammes**: Distribution variables numériques
- 📈 **Line charts**: Évolution temporelle
- 🥧 **Pie charts**: Proportions catégorielles
- 🔥 **Heatmaps**: Matrices de corrélation
- 📉 **Box plots**: Détection outliers
- 📊 **Bar charts**: Comparaisons catégorielles

#### Comparaison Avant/Après

- ✅ Statistiques descriptives (mean, median, std)
- ✅ Valeurs manquantes (count, %)
- ✅ Distribution (histogrammes)
- ✅ Corrélations (heatmap)
- ✅ Nombre de doublons supprimés

### 2.3 Fusion de Datasets

**Endpoint**: `/fuse-datasets`

#### Processus de Fusion

```python
@app.post("/fuse-datasets")
def fuse_datasets(req: FusionRequest, db: Session = Depends(get_db)):
    """Fusion intelligente avec validation stricte"""
    
    # 1. Extraire schéma de référence
    def get_schema(ds):
        keys = list(ds[0].keys())
        types = {k: _infer_type(next((row[k] for row in ds if row.get(k)), None)) 
                 for k in keys}
        return keys, types
    
    base_keys, base_types = get_schema(datasets[0])
    
    # 2. Valider compatibilité
    can_fuse = True
    diagnostics = []
    
    for idx, ds in enumerate(datasets[1:], start=1):
        keys, types = get_schema(ds)
        
        # Vérifier colonnes
        if set(keys) != set(base_keys):
            can_fuse = False
            diagnostics.append(f"Dataset {idx} columns mismatch")
        
        # Vérifier types
        for col in set(base_keys) & set(keys):
            if base_types[col] != types[col]:
                can_fuse = False
                diagnostics.append(f"Column '{col}' type mismatch")
    
    # 3. Fusionner si compatible
    if can_fuse:
        fused = []
        for ds in datasets:
            for row in ds:
                fused.append({k: row.get(k) for k in base_keys})
        
        return {"can_fuse": True, "data": fused, "row_count": len(fused)}
    
    return {"can_fuse": False, "diagnostics": diagnostics}
```

#### Vérifications

1. ✅ **Colonnes identiques** (même nombre et noms)
2. ✅ **Types compatibles** (number, string, date, boolean)
3. ✅ **Datasets non vides**
4. ✅ **Ordre préservé**

---

## 🛠️ Architecture Technique

### Technologies Frontend

```json
{
  "next": "^15.1.6",
  "react": "^19.0.0",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "zod": "^3.24.2",
  "recharts": "^2.15.0",
  "shadcn/ui": "latest"
}
```

### Technologies Backend

```txt
fastapi==0.118.2
pandas==2.3.3
numpy==2.3.3
scikit-learn==1.7.2
argon2-cffi==25.1.0
sqlalchemy==2.0.43
openpyxl==3.1.5
```

---

## 🚀 Installation

### Backend

```bash
cd server
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env
npm run dev
```

### URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔒 Analyse de Sécurité

### Points Forts

✅ **Argon2**: Algorithme de hachage état de l'art  
✅ **Validation stricte**: Regex complexe pour mots de passe  
✅ **Double validation**: Client (Zod) + Serveur (Pydantic)  
✅ **Messages génériques**: Pas d'énumération d'emails  
✅ **CORS configuré**: Protection cross-origin

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Brute Force** | 🔴 Élevé | 🔴 Élevée | Rate limiting + CAPTCHA |
| **XSS** | 🔴 Élevé | 🟡 Moyenne | CSP + sanitization |
| **Pas de HTTPS** | 🔴 Élevé | 🔴 Élevée | Certificat SSL/TLS |
| **LocalStorage** | 🟡 Moyen | 🟡 Moyenne | HttpOnly cookies + JWT |
| **Pas de 2FA** | 🟡 Moyen | 🟢 Faible | TOTP/SMS 2FA |

### Améliorations Recommandées

#### 1. Limitation à 3 Tentatives

```python
from collections import defaultdict
from datetime import datetime, timedelta

login_attempts = defaultdict(list)
MAX_ATTEMPTS = 3
LOCKOUT_DURATION = timedelta(minutes=15)

@app.post("/login")
def login(user: UserLogin):
    now = datetime.now()
    email = user.email
    
    # Nettoyer anciennes tentatives
    login_attempts[email] = [t for t in login_attempts[email] 
                             if now - t < LOCKOUT_DURATION]
    
    # Vérifier verrouillage
    if len(login_attempts[email]) >= MAX_ATTEMPTS:
        raise HTTPException(429, "Too many attempts. Try in 15 minutes.")
    
    # Authentification
    db_user = authenticate(user)
    if not db_user:
        login_attempts[email].append(now)
        remaining = MAX_ATTEMPTS - len(login_attempts[email])
        raise HTTPException(400, f"Invalid credentials. {remaining} attempts left.")
    
    # Réinitialiser en cas de succès
    login_attempts[email] = []
    return {"access_token": "..."}
```

#### 2. JWT Tokens

```python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/login")
def login(user: UserLogin):
    db_user = authenticate(user)
    access_token = create_access_token({"sub": db_user.email, "id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}
```

#### 3. Rate Limiting Global

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/login")
@limiter.limit("5/minute")
def login(request: Request, user: UserLogin):
    ...
```

---

## 💡 Questions Réflexives

### Q1: Risques de sécurité subsistants et atténuations?

**Risques critiques identifiés:**

1. **Absence de limitation tentatives** → Brute force possible
   - **Solution**: Rate limiting (5 tentatives/minute) + CAPTCHA après 3 échecs
   - **Implémentation**: Redis pour tracking + reCAPTCHA v3

2. **Pas de HTTPS en production** → Interception mots de passe
   - **Solution**: Certificat SSL/TLS (Let's Encrypt gratuit)
   - **Configuration**: Nginx reverse proxy avec force HTTPS

3. **LocalStorage vulnérable** → Vol de session via XSS
   - **Solution**: HttpOnly cookies + JWT + CSP headers
   - **Benefit**: Cookies inaccessibles via JavaScript

4. **Pas d'audit logging** → Aucune traçabilité
   - **Solution**: Logs structurés (IP, timestamp, action, résultat)
   - **Outils**: ELK stack ou CloudWatch

5. **Pas de 2FA** → Compromission mot de passe = accès total
   - **Solution**: TOTP (Google Authenticator) ou SMS
   - **Implémentation**: pyotp library

### Q2: Biais introduits par le prétraitement?

**Biais potentiels et solutions:**

1. **Imputation par moyenne**
   - **Biais**: Réduit variance, sous-estime incertitude, suppose distribution normale
   - **Impact**: Corrélations artificielles, intervalles de confiance trop étroits
   - **Solution**: 
     - Imputation multiple (MICE) pour préserver incertitude
     - Ajouter indicateur binaire `was_imputed`
     - Tester robustesse avec différentes méthodes

2. **Suppression de lignes (dropna)**
   - **Biais**: Perte d'information, biais de sélection si MNAR (Missing Not At Random)
   - **Impact**: Conclusions erronées si pattern de manquement non aléatoire
   - **Solution**:
     - Analyser pattern: MCAR (complètement aléatoire) vs MAR vs MNAR
     - Test de Little MCAR
     - Si < 5% manquant: suppression acceptable

3. **Normalisation Min-Max**
   - **Biais**: Très sensible aux outliers (un outlier change min/max)
   - **Impact**: Compression des valeurs normales dans petit intervalle
   - **Solution**:
     - RobustScaler (utilise médiane et IQR)
     - Détection outliers avant normalisation (IQR, Z-score)
     - Winsorization (cap à percentiles)

4. **Standardisation Z-score**
   - **Biais**: Suppose distribution gaussienne
   - **Impact**: Inefficace si distribution skewed ou multimodale
   - **Solution**:
     - Tests de normalité (Shapiro-Wilk, Kolmogorov-Smirnov)
     - Transformations: log, Box-Cox, Yeo-Johnson
     - Quantile transformer si non-gaussien

5. **Suppression doublons**
   - **Biais**: Peut supprimer observations légitimes répétées
   - **Impact**: Perte d'information sur fréquence réelle
   - **Solution**:
     - Vérifier contexte métier (transactions multiples valides?)
     - Garder agrégats (count, mean) si doublons informatifs
     - Définir clés de déduplication précises

### Q3: Évaluer la qualité de la fusion?

**Indicateurs et métriques:**

#### 1. Cohérence Schéma
```python
def validate_schema_consistency(datasets):
    base_schema = get_schema(datasets[0])
    
    for i, ds in enumerate(datasets[1:], 1):
        schema = get_schema(ds)
        
        # Même colonnes
        assert set(base_schema.keys()) == set(schema.keys()), \
            f"Dataset {i} column mismatch"
        
        # Mêmes types
        for col in base_schema:
            assert base_schema[col] == schema[col], \
                f"Column {col} type mismatch in dataset {i}"
```

#### 2. Intégrité Données
```python
def check_data_integrity(original_datasets, fused):
    # Nombre total lignes
    expected_rows = sum(len(ds) for ds in original_datasets)
    assert len(fused) == expected_rows, "Row count mismatch"
    
    # Pas de NULL introduits
    original_nulls = sum(count_nulls(ds) for ds in original_datasets)
    fused_nulls = count_nulls(fused)
    assert fused_nulls == original_nulls, "New NULLs introduced"
    
    # Pas de doublons introduits (si clé unique existe)
    if 'id' in fused[0]:
        ids = [row['id'] for row in fused]
        assert len(ids) == len(set(ids)), "Duplicate IDs introduced"
```

#### 3. Métriques Statistiques
```python
import numpy as np
from scipy import stats

def compare_distributions(original_datasets, fused):
    """Vérifier que distributions sont préservées"""
    
    for col in fused[0].keys():
        # Distribution originale (weighted average)
        original_values = []
        for ds in original_datasets:
            original_values.extend([row[col] for row in ds if row[col]])
        
        # Distribution fusionnée
        fused_values = [row[col] for row in fused if row[col]]
        
        # Test Kolmogorov-Smirnov
        statistic, p_value = stats.ks_2samp(original_values, fused_values)
        
        assert p_value > 0.05, \
            f"Distribution changed significantly for {col} (p={p_value})"
        
        print(f"✅ {col}: distribution preserved (p={p_value:.3f})")

def compare_correlations(original_datasets, fused):
    """Vérifier que corrélations sont préservées"""
    
    # Corrélations originales
    original_df = pd.concat([pd.DataFrame(ds) for ds in original_datasets])
    original_corr = original_df.corr()
    
    # Corrélations fusionnées
    fused_df = pd.DataFrame(fused)
    fused_corr = fused_df.corr()
    
    # Différence maximale
    max_diff = (original_corr - fused_corr).abs().max().max()
    
    assert max_diff < 0.01, \
        f"Correlations changed significantly (max diff={max_diff})"
    
    print(f"✅ Correlations preserved (max diff={max_diff:.4f})")
```

#### 4. Tests Statistiques
```python
def run_statistical_tests(original_datasets, fused):
    """Suite complète de tests"""
    
    # Test de normalité (si attendu)
    from scipy.stats import shapiro
    for col in numeric_columns:
        stat, p = shapiro(fused_df[col].dropna())
        print(f"{col}: Shapiro p-value={p:.3f}")
    
    # Test Chi-carré (variables catégorielles)
    from scipy.stats import chi2_contingency
    for col in categorical_columns:
        original_freq = get_frequency(original_datasets, col)
        fused_freq = get_frequency(fused, col)
        chi2, p, dof, expected = chi2_contingency([original_freq, fused_freq])
        assert p > 0.05, f"Frequency distribution changed for {col}"
    
    # Test d'homogénéité variance (Levene)
    from scipy.stats import levene
    for col in numeric_columns:
        datasets_values = [[row[col] for row in ds] for ds in original_datasets]
        stat, p = levene(*datasets_values)
        print(f"{col}: Levene p-value={p:.3f}")
```

#### 5. Rapport de Fusion
```python
def generate_fusion_report(original_datasets, fused):
    """Rapport complet de qualité fusion"""
    
    report = {
        "datasets_count": len(original_datasets),
        "total_rows": {
            "expected": sum(len(ds) for ds in original_datasets),
            "actual": len(fused),
            "match": "✅" if len(fused) == sum(len(ds) for ds in original_datasets) else "❌"
        },
        "schema": {
            "columns": list(fused[0].keys()),
            "types": get_schema(fused),
        },
        "data_quality": {
            "null_count": count_nulls(fused),
            "duplicate_count": count_duplicates(fused),
        },
        "statistics": {
            "distributions_preserved": check_distributions(original_datasets, fused),
            "correlations_preserved": check_correlations(original_datasets, fused),
        }
    }
    
    return report
```

---

## 🎓 Conclusion

Ce projet démontre une implémentation complète des exigences du TP :

### ✅ Réalisations Partie 1

- **Authentification sécurisée** avec Argon2
- **Validation stricte** des mots de passe (8+ car., maj+min+chiffre+spécial)
- **Interface moderne** avec éléments Microsoft (barre titre, menu, outils)
- **Gestion erreurs** avec messages explicites

### ✅ Réalisations Partie 2

- **Prétraitement complet**: normalisation, standardisation, gestion NA, doublons
- **Détection intelligente** des colonnes ID
- **Visualisations** avant/après traitement
- **Fusion datasets** avec validation stricte de schéma
- **Export** et sauvegarde des résultats

### 🔄 Améliorations Futures

- Rate limiting et limitation 3 tentatives
- JWT tokens avec HttpOnly cookies
- Déploiement HTTPS en production
- Audit logging complet
- 2FA (TOTP/SMS)
- Tests automatisés (Pytest, Jest)
- CI/CD pipeline

---

**Date**: 13 Octobre 2025  
**Repository**: [GitHub URL]
