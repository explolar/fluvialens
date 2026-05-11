##### !/usr/bin/env python3
"""
CMIP6 Data Downloader - Interactive Browser with Advanced Filtering
Author: Climate Data Automation
Version: 2.1

Features:
- Multiple experiment selection with separate model selection per experiment
- Advanced model filtering (include/exclude with conflict detection)
- Per-model realization selection
- Multiple ESGF nodes including NCI Australia & CEDA UK
- Shows only available options at each step
- Downloads all unique files (no limits)

Usage: python cmip6_downloader.py
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path
from collections import defaultdict

class CMIP6Browser:
    def __init__(self, output_dir="cmip6_data"):
        """Initialize the CMIP6 browser and downloader"""
        self.search_nodes = [
            "https://esgf-node.llnl.gov/esg-search/search",
            "https://esgf-data.dkrz.de/esg-search/search",
            "https://esgf-node.ipsl.upmc.fr/esg-search/search",
            "https://esgf.nci.org.au/esg-search/search",
            "https://esgf-index1.ceda.ac.uk/esg-search/search",
        ]
        self.aims2_url = "https://aims2.llnl.gov/search/api/search"
       
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'CMIP6-Downloader/1.0'})
   
    def get_available_facets(self, facet_name, existing_filters=None):
        """Get all available values for a specific facet from ALL nodes and merge"""
        existing_filters = existing_filters or {}
       
        params = {
            'project': 'CMIP6',
            'format': 'application/solr+json',
            'type': 'Dataset',
            'facets': facet_name,
            'limit': 0,
            'retracted': 'false',
            'latest': 'true',
            **existing_filters
        }
       
        print(f"\n🔍 Fetching available {facet_name} from all nodes...")
       
        all_facets = {}
        nodes_with_data = []
       
        # Try ALL nodes and MERGE results
        for node_url in self.search_nodes:
            try:
                node_name = node_url.split('/')[2]
                response = self.session.get(node_url, params=params, timeout=30)
               
                if response.status_code == 200:
                    data = response.json()
                   
                    if 'facet_counts' in data and 'facet_fields' in data['facet_counts']:
                        facet_data = data['facet_counts']['facet_fields'].get(facet_name, [])
                       
                        node_facets = 0
                        for i in range(0, len(facet_data), 2):
                            if i + 1 < len(facet_data):
                                value = facet_data[i]
                                count = facet_data[i + 1]
                                if count > 0:
                                    all_facets[value] = all_facets.get(value, 0) + count
                                    node_facets += 1
                       
                        if node_facets > 0:
                            nodes_with_data.append(node_name)
                            print(f"  ✓ {node_name}: {node_facets} options")
               
            except Exception as e:
                continue
       
        # Try AIMS2
        try:
            params['type'] = 'File'
            response = self.session.get(self.aims2_url, params=params, timeout=30)
           
            if response.status_code == 200:
                data = response.json()
                if 'facet_counts' in data and 'facet_fields' in data['facet_counts']:
                    facet_data = data['facet_counts']['facet_fields'].get(facet_name, [])
                    node_facets = 0
                    for i in range(0, len(facet_data), 2):
                        if i + 1 < len(facet_data):
                            value = facet_data[i]
                            count = facet_data[i + 1]
                            if count > 0:
                                all_facets[value] = all_facets.get(value, 0) + count
                                node_facets += 1
                    if node_facets > 0:
                        nodes_with_data.append("AIMS2")
                        print(f"  ✓ AIMS2: {node_facets} options")
        except:
            pass
       
        if all_facets:
            print(f"✅ Total: {len(all_facets)} unique options from {len(nodes_with_data)} node(s)")
        else:
            print(f"❌ No options found on any node")
       
        return all_facets
   
    def search_files(self, **filters):
        """Search for actual files with given filters"""
        params = {
            'project': 'CMIP6',
            'format': 'application/solr+json',
            'limit': 10000,
            'offset': 0,
            'type': 'File',
            'retracted': 'false',
            'latest': 'true',
            **filters
        }
       
        print(f"\n🔍 Searching for files...")
        for k, v in filters.items():
            print(f"   {k}: {v}")
       
        # Try standard nodes first
        for node_url in self.search_nodes:
            try:
                node_name = node_url.split('/')[2]
                print(f"\n📡 Trying {node_name}...")
               
                response = self.session.get(node_url, params=params, timeout=30)
               
                if response.status_code == 200:
                    data = response.json()
                    if 'response' in data:
                        num_found = data['response']['numFound']
                        docs = data['response']['docs']
                       
                        if num_found > 0:
                            print(f"✅ Found {num_found} files")
                            return docs
                        else:
                            print(f"⚠️  No results")
                else:
                    print(f"⚠️  HTTP {response.status_code}")
                   
            except Exception as e:
                print(f"⚠️  Error: {str(e)[:50]}")
                continue
       
        # Try AIMS2
        try:
            print(f"\n📡 Trying AIMS2...")
            response = self.session.get(self.aims2_url, params=params, timeout=30)
           
            if response.status_code == 200:
                data = response.json()
                if 'response' in data:
                    num_found = data['response']['numFound']
                    docs = data['response']['docs']
                    if num_found > 0:
                        print(f"✅ Found {num_found} files from AIMS2")
                        return docs
        except Exception as e:
            print(f"⚠️  AIMS2 error: {str(e)[:50]}")
       
        return []
   
    def interactive_browse(self):
        """Step-by-step interactive browsing"""
        print("\n" + "="*70)
        print("🌐 INTERACTIVE DATA BROWSER")
        print("="*70)
        print("We'll show you available options at each step.\n")
       
        filters = {}
       
        # Step 1: Variable
        print("\n" + "="*70)
        print("STEP 1: SELECT VARIABLE")
        print("="*70)
       
        available_vars = self.get_available_facets('variable_id', filters)
       
        if not available_vars:
            print("❌ Could not fetch variables")
            return
       
        sorted_vars = sorted(available_vars.items(), key=lambda x: x[1], reverse=True)
       
        print(f"\nAvailable variables ({len(sorted_vars)} total):")
        print("(Showing top 50 by dataset count)\n")
       
        display_vars = sorted_vars[:50]
        for i, (var, count) in enumerate(display_vars, 1):
            print(f"{i:3d}. {var:20s} ({count:6d} datasets)")
       
        while True:
            selection = input(f"\nEnter variable name or number (1-{len(display_vars)}) [or 'more']: ").strip()
           
            if selection.lower() == 'more':
                print("\nAll variables:")
                for i, (var, count) in enumerate(sorted_vars, 1):
                    print(f"{i:3d}. {var:20s} ({count:6d} datasets)")
                continue
           
            if selection.isdigit():
                idx = int(selection) - 1
                if 0 <= idx < len(display_vars):
                    filters['variable_id'] = display_vars[idx][0]
                    print(f"✅ Selected: {filters['variable_id']}")
                    break
            elif selection in available_vars:
                filters['variable_id'] = selection
                print(f"✅ Selected: {selection}")
                break
            else:
                print("❌ Invalid selection")
       
        # Step 2: Experiment(s) - MULTIPLE SELECTION
        print("\n" + "="*70)
        print("STEP 2: SELECT EXPERIMENT(S)")
        print("="*70)
       
        available_exps = self.get_available_facets('experiment_id', filters)
       
        if not available_exps:
            print("❌ No experiments available")
            return
       
        sorted_exps = sorted(available_exps.items(), key=lambda x: x[1], reverse=True)
       
        print(f"\nAvailable experiments for {filters['variable_id']}:\n")
        for i, (exp, count) in enumerate(sorted_exps, 1):
            print(f"{i:3d}. {exp:30s} ({count:6d} datasets)")
       
        print("\n💡 You can select MULTIPLE experiments:")
        print("   • Single: piClim-aer  OR  1")
        print("   • Multiple: piClim-aer,piClim-Control  OR  1,2,5")
       
        selected_experiments = []
       
        while True:
            selection = input(f"\nEnter experiment(s): ").strip()
           
            if not selection:
                print("❌ Must select at least one experiment")
                continue
           
            parts = [p.strip() for p in selection.replace(" ", "").split(",")]
            selected_exps = []
            invalid = []
           
            for part in parts:
                if part.isdigit():
                    idx = int(part) - 1
                    if 0 <= idx < len(sorted_exps):
                        selected_exps.append(sorted_exps[idx][0])
                    else:
                        invalid.append(part)
                elif part in available_exps:
                    selected_exps.append(part)
                else:
                    invalid.append(part)
           
            if invalid:
                print(f"❌ Invalid: {', '.join(invalid)}")
                continue
           
            if selected_exps:
                selected_experiments = list(set(selected_exps))
                print(f"✅ Selected {len(selected_experiments)} experiment(s): {', '.join(selected_experiments)}")
                break
       
        # Step 3: Frequency
        print("\n" + "="*70)
        print("STEP 3: SELECT FREQUENCY")
        print("="*70)
       
        available_freqs = self.get_available_facets('frequency', filters)
       
        if available_freqs:
            sorted_freqs = sorted(available_freqs.items(), key=lambda x: x[1], reverse=True)
           
            print(f"\nAvailable frequencies:\n")
            for i, (freq, count) in enumerate(sorted_freqs, 1):
                print(f"{i:3d}. {freq:15s} ({count:6d} datasets)")
           
            selection = input(f"\nEnter frequency or number [Enter to skip]: ").strip()
           
            if selection:
                if selection.isdigit():
                    idx = int(selection) - 1
                    if 0 <= idx < len(sorted_freqs):
                        filters['frequency'] = sorted_freqs[idx][0]
                        print(f"✅ Selected: {filters['frequency']}")
                elif selection in available_freqs:
                    filters['frequency'] = selection
                    print(f"✅ Selected: {selection}")
       
        # Step 4: Table
        print("\n" + "="*70)
        print("STEP 4: SELECT TABLE")
        print("="*70)
       
        available_tables = self.get_available_facets('table_id', filters)
       
        if available_tables:
            sorted_tables = sorted(available_tables.items(), key=lambda x: x[1], reverse=True)
           
            print(f"\nAvailable tables:\n")
            for i, (table, count) in enumerate(sorted_tables, 1):
                print(f"{i:3d}. {table:15s} ({count:6d} datasets)")
           
            selection = input(f"\nEnter table or number [Enter to skip]: ").strip()
           
            if selection:
                if selection.isdigit():
                    idx = int(selection) - 1
                    if 0 <= idx < len(sorted_tables):
                        filters['table_id'] = sorted_tables[idx][0]
                        print(f"✅ Selected: {filters['table_id']}")
                elif selection in available_tables:
                    filters['table_id'] = selection
                    print(f"✅ Selected: {selection}")
       
        # NOW: Search and select models FOR EACH EXPERIMENT separately
        all_filtered_docs = []
       
        for exp_idx, experiment in enumerate(selected_experiments, 1):
            print(f"\n{'='*70}")
            print(f"EXPERIMENT {exp_idx}/{len(selected_experiments)}: {experiment}")
            print(f"{'='*70}")
           
            exp_filters = filters.copy()
            exp_filters['experiment_id'] = experiment
           
            docs = self.search_files(**exp_filters)
           
            if not docs:
                print(f"⚠️  No files found for {experiment}")
                continue
           
            # Get models and select
            result_docs = self.select_models_for_experiment(docs, experiment)
           
            if result_docs:
                all_filtered_docs.extend(result_docs)
       
        if not all_filtered_docs:
            print("\n⚠️  No files selected across all experiments")
            return
       
        # Final download summary
        self.download_summary_and_execute(all_filtered_docs)
   
    def select_models_for_experiment(self, docs, experiment_name):
        """Select models and realizations for a single experiment"""
        model_realizations = {}
       
        for doc in docs:
            source_id = doc.get('source_id', ['Unknown'])[0] if isinstance(doc.get('source_id'), list) else doc.get('source_id', 'Unknown')
            variant = doc.get('variant_label', ['Unknown'])[0] if isinstance(doc.get('variant_label'), list) else doc.get('variant_label', 'Unknown')
           
            if source_id not in model_realizations:
                model_realizations[source_id] = set()
           
            if variant and variant != 'Unknown':
                r_part = variant.split('i')[0]
                model_realizations[source_id].add(r_part)
       
        for model in model_realizations:
            model_realizations[model] = sorted(list(model_realizations[model]))
       
        print(f"\n{'='*70}")
        print(f"AVAILABLE MODELS ({len(model_realizations)} total)")
        print(f"{'='*70}\n")
       
        for i, (model, realizations) in enumerate(sorted(model_realizations.items()), 1):
            print(f"{i:3d}. {model:30s} | Realizations: {', '.join(realizations)}")
       
        # Filter models
        print(f"\n{'='*70}")
        print(f"FILTER MODELS")
        print(f"{'='*70}")
        print("  1. Select specific models you WANT")
        print("  2. Select models you DON'T WANT")
        print("  3. Advanced: Both include AND exclude")
        print("  4. All models (no filtering)")
        print(f"{'='*70}\n")
       
        models_to_process = self.get_filtered_models(model_realizations)
       
        if not models_to_process:
            print(f"⚠️  No models selected for {experiment_name}")
            return []
       
        # Select realizations
        model_selections = self.select_realizations(models_to_process, model_realizations)
       
        if not model_selections:
            print(f"⚠️  No models selected for {experiment_name}")
            return []
       
        # Filter docs
        filtered = []
        for doc in docs:
            source_id = doc.get('source_id', [''])[0] if isinstance(doc.get('source_id'), list) else doc.get('source_id', '')
            variant = doc.get('variant_label', [''])[0] if isinstance(doc.get('variant_label'), list) else doc.get('variant_label', '')
           
            if source_id in model_selections:
                if 'all' in model_selections[source_id]:
                    filtered.append(doc)
                else:
                    if variant:
                        r_part = variant.split('i')[0]
                        if r_part in model_selections[source_id]:
                            filtered.append(doc)
       
        print(f"\n✅ Selected {len(filtered)} files from {experiment_name}")
       
        return filtered
   
    def get_filtered_models(self, model_realizations):
        """Get filtered list of models based on user choice"""
        all_models = sorted(model_realizations.keys())
       
        while True:
            choice = input("Choose option [1/2/3/4]: ").strip()
           
            if choice not in ["1", "2", "3", "4"]:
                print(f"❌ Invalid. Enter 1, 2, 3, or 4")
                continue
           
            if choice == "4":
                print(f"✅ All {len(all_models)} models selected")
                return all_models
           
            if choice == "1":
                print("\n📌 SELECT MODELS TO INCLUDE")
                print("Enter model numbers separated by commas (e.g., 1,3,5)")
               
                while True:
                    sel = input("Models to INCLUDE: ").strip()
                    if not sel:
                        print("❌ Must select at least one")
                        continue
                   
                    models, invalid = self.parse_model_numbers(sel, all_models)
                    if invalid:
                        print(f"❌ Invalid: {', '.join(invalid)} (valid: 1-{len(all_models)})")
                        continue
                   
                    print(f"✅ Selected {len(models)} model(s)")
                    return models
           
            if choice == "2":
                print("\n📌 SELECT MODELS TO EXCLUDE")
                sel = input("Models to EXCLUDE [Enter=none]: ").strip()
               
                if not sel:
                    return all_models
               
                excluded, invalid = self.parse_model_numbers(sel, all_models)
                if invalid:
                    print(f"⚠️  Invalid ignored: {', '.join(invalid)}")
               
                models = [m for m in all_models if m not in excluded]
                print(f"✅ Selected {len(models)} model(s)")
                return models
           
            if choice == "3":
                print("\n📌 ADVANCED FILTERING")
               
                print("\nStep 1: Models to INCLUDE [Enter=all]")
                inc_sel = input("INCLUDE: ").strip()
               
                if inc_sel:
                    included, _ = self.parse_model_numbers(inc_sel, all_models)
                else:
                    included = all_models
               
                print("\nStep 2: Models to EXCLUDE [Enter=none]")
                exc_sel = input("EXCLUDE: ").strip()
               
                if exc_sel:
                    excluded, _ = self.parse_model_numbers(exc_sel, all_models)
                else:
                    excluded = []
               
                conflicts = set(included) & set(excluded)
                if conflicts:
                    print(f"\n❌ ERROR: Can't include AND exclude same models!")
                    print(f"   Conflicts: {', '.join(conflicts)}")
                    print("🔄 Try again...\n")
                    continue
               
                models = [m for m in included if m not in excluded]
                print(f"✅ Selected {len(models)} model(s)")
                return models
   
    def parse_model_numbers(self, selection, model_list):
        """Parse comma-separated numbers into model names"""
        parts = [p.strip() for p in selection.split(",")]
        selected = []
        invalid = []
       
        for part in parts:
            if part.isdigit():
                idx = int(part) - 1
                if 0 <= idx < len(model_list):
                    selected.append(model_list[idx])
                else:
                    invalid.append(part)
            else:
                invalid.append(part)
       
        return selected, invalid
   
    def select_realizations(self, models, model_realizations):
        """Select realizations for each model"""
        print(f"\n{'='*70}")
        print(f"SELECT REALIZATIONS")
        print(f"{'='*70}")
        print("For each model:")
        print("  • 'all' = all realizations")
        print("  • r1,r2,r3 or 1,2,3 = specific")
        print("  • Enter = SKIP model")
        print(f"{'='*70}\n")
       
        selections = {}
       
        for model in models:
            realizations = model_realizations[model]
           
            print(f"\n📌 {model}")
            print(f"   Available: {', '.join(realizations)}")
           
            while True:
                sel = input("   Select [Enter=skip | all | r1,r2]: ").strip().lower()
               
                if sel == "":
                    print(f"   ⏭️  Skipped")
                    break
               
                if sel == "all":
                    selections[model] = ["all"]
                    print(f"   ✅ ALL")
                    break
               
                parts = [p.strip() for p in sel.replace(" ", "").split(",")]
                selected = []
                invalid = []
               
                for part in parts:
                    if part.startswith("r"):
                        if part in realizations:
                            selected.append(part)
                        else:
                            invalid.append(part)
                    elif part.isdigit():
                        r = f"r{part}"
                        if r in realizations:
                            selected.append(r)
                        else:
                            invalid.append(r)
               
                if invalid:
                    print(f"   ❌ Invalid: {', '.join(invalid)}")
                    continue
               
                if selected:
                    selections[model] = selected
                    print(f"   ✅ {', '.join(selected)}")
                    break
       
        return selections
   
    def download_summary_and_execute(self, all_docs):
        """Show final summary and download"""
        print(f"\n{'='*70}")
        print(f"FINAL DOWNLOAD SUMMARY")
        print(f"{'='*70}")
        print(f"Total files: {len(all_docs)}")
       
        # Check for problematic URLs
        problematic = []
        for doc in all_docs:
            urls = doc.get('url', [])
            http_urls = [u.split('|')[0] for u in urls if 'HTTPServer' in u]
           
            if not http_urls:
                problematic.append(doc.get('title', 'unknown'))
            elif any(len(url) < 30 or not url.startswith('http') for url in http_urls):
                problematic.append(doc.get('title', 'unknown'))
       
        if problematic:
            print(f"\n⚠️  WARNING: {len(problematic)} file(s) may have invalid URLs:")
            for fname in problematic[:5]:
                print(f"   • {fname}")
            if len(problematic) > 5:
                print(f"   ... and {len(problematic) - 5} more")
            print(f"\n💡 These files will be skipped during download")
       
        # Group by experiment and model
        exp_model_counts = defaultdict(lambda: defaultdict(int))
       
        for doc in all_docs:
            exp = doc.get('experiment_id', ['?'])[0] if isinstance(doc.get('experiment_id'), list) else doc.get('experiment_id', '?')
            model = doc.get('source_id', ['?'])[0] if isinstance(doc.get('source_id'), list) else doc.get('source_id', '?')
            exp_model_counts[exp][model] += 1
       
        print(f"\nBreakdown by experiment and model:")
        for exp in sorted(exp_model_counts.keys()):
            print(f"\n  {exp}:")
            for model, count in sorted(exp_model_counts[exp].items()):
                print(f"    • {model}: {count} files")
       
        print(f"{'='*70}")
       
        proceed = input("\n▶️  Start download? (y/n): ")
       
        if proceed.lower() != 'y':
            print("❌ Cancelled")
            return
       
        print(f"\n⬇️  DOWNLOADING {len(all_docs)} FILES...")
        print(f"📂 Output: {self.output_dir.absolute()}\n")
       
        success = 0
        failed = 0
        skipped = 0
       
        for i, doc in enumerate(all_docs, 1):
            print(f"\n[{i}/{len(all_docs)}]")
            result = self.download_file(doc)
           
            if result is True:
                success += 1
            elif result is False:
                failed += 1
            else:
                skipped += 1
       
        print(f"\n{'='*70}")
        print(f"✨ DOWNLOAD COMPLETE")
        print(f"{'='*70}")
        print(f"Total files: {len(all_docs)}")
        print(f"✅ Downloaded: {success}")
        print(f"❌ Failed: {failed}")
        if skipped > 0:
            print(f"⏭️  Skipped (already exist): {skipped}")
        print(f"📂 Location: {self.output_dir.absolute()}")
        print(f"{'='*70}\n")
       
        if failed > 0:
            print("💡 Some files failed - common reasons:")
            print("   • Server hosting the file is down")
            print("   • File was moved/deleted from the server")
            print("   • Network connectivity issues")
            print("   • Try downloading failed files later or from a different node\n")
    def download_file(self, file_info):
        """Download a single file with multiple replica / URL fallbacks"""
        try:
            urls = file_info.get('url', [])
            all_http_urls = []

            # Parse all access URLs (url|mime|service)
            for u in urls:
                parts = u.split('|')
                if len(parts) < 3:
                    continue
                url, mime, service = parts[0], parts[1], parts[2]

                if not url.startswith('http'):
                    continue

                entry = {
                    "url": url,
                    "mime": mime,
                    "service": service
                }
                all_http_urls.append(entry)

            # Nothing usable at all
            if not all_http_urls:
                print("⚠️  No HTTP-like URLs found in metadata")
                return False

            # Build priority list:
            # 1) AIMS2 / Globus HTTP
            # 2) Standard ESGF HTTPServer
            # 3) Any other long http(s) URL that looks like a file
            ordered_urls = []

            # 1) AIMS2 / Globus (data.globus.org, css03_data etc.)
            for e in all_http_urls:
                u = e["url"]
                if "data.globus.org" in u or "/css03_data/" in u:
                    ordered_urls.append(u)

            # 2) HTTPServer replicas
            for e in all_http_urls:
                if e["service"] == "HTTPServer":
                    u = e["url"]
                    if u not in ordered_urls:
                        ordered_urls.append(u)

            # 3) Generic long http(s) URLs ending in .nc
            for e in all_http_urls:
                u = e["url"]
                if u in ordered_urls:
                    continue
                if u.endswith(".nc") and len(u) > 30:
                    ordered_urls.append(u)

            if not ordered_urls:
                print("⚠️  No valid download URL candidates after filtering")
                return False

            filename = file_info.get('title', 'unknown.nc')
            filepath = self.output_dir / filename

            source_id = file_info.get('source_id', ['?'])[0] if isinstance(file_info.get('source_id'), list) else file_info.get('source_id', '?')
            variant = file_info.get('variant_label', ['?'])[0] if isinstance(file_info.get('variant_label'), list) else file_info.get('variant_label', '?')

            # Skip existing
            if filepath.exists():
                print(f"⏭️  Exists: {filename}")
                return True

            file_size = file_info.get('size', 0) / (1024**2)
            print(f"⬇️  {source_id} | {variant} | {filename} ({file_size:.1f} MB)")

            # Try each replica in priority order
            for idx, download_url in enumerate(ordered_urls, 1):
                try:
                    if len(ordered_urls) > 1:
                        print(f"   Trying replica {idx}/{len(ordered_urls)}:")
                        print(f"   {download_url}")

                    resp = self.session.get(download_url, stream=True, timeout=120)
                    if resp.status_code == 404:
                        print("   ⚠️  404 Not Found on this replica")
                        continue  # try next replica

                    resp.raise_for_status()

                    downloaded = 0
                    total = int(resp.headers.get('content-length', 0))

                    with open(filepath, 'wb') as f:
                        for chunk in resp.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                                downloaded += len(chunk)
                                if total > 0 and downloaded % (1024*1024) == 0:
                                    pct = (downloaded / total) * 100
                                    print(f"   {pct:.0f}%", end="\r")

                    print("✅ Downloaded successfully")
                    return True

                except requests.exceptions.Timeout:
                    print("   ⚠️  Timeout, trying next replica...")
                    continue

                except requests.exceptions.HTTPError as e:
                    print(f"   ⚠️  HTTP error {e.response.status_code}, trying next replica...")
                    continue

                except Exception as e:
                    print(f"   ⚠️  Error on this replica: {str(e)[:80]}")
                    continue

            # If we get here, every replica failed
            print("❌ All replicas failed (HTTP/timeout/errors)")
            return False

        except Exception as e:
            print(f"❌ Error in download_file: {str(e)[:80]}")
            return False



def main():
    """Main entry point"""
    print("\n" + "="*70)
    print("🌐 CMIP6 INTERACTIVE DATA BROWSER & DOWNLOADER")
    print("="*70)
   
    output_dir = input("\nOutput directory [cmip6_data]: ").strip() or "cmip6_data"
   
    browser = CMIP6Browser(output_dir=output_dir)
    browser.interactive_browse()


if __name__ == "__main__":
    main()