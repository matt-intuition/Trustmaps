# PRD — Trustmaps

# **PRD: Google Maps Saved Lists Search, Discovery & InfoFi Marketplace**

### **(Hackathon Prototype with Intuition-Styled Staking, Reputation & Marketplace Features)**

---

# **0. Executive Summary**

We are building a centralized prototype that:

1. **Imports** Google Maps Saved Lists.
2. **Enriches** the data into a searchable, filterable personal database.
3. Allows users to **organize and explore** their saved places.
4. Launches a **Marketplace** for curated public and paid lists.
5. Enables creators to **monetize** their lists.
6. Introduces simulated **TRUST staking, revenue flows, and reputation**, aligned with Intuition’s long-term cryptoeconomic design.
7. Protects creator IP: purchased lists **cannot be cloned or edited** — only **viewed and exported**.

Future: full Intuition integration → atoms, triples, staking, identity, reputation.

---

# **1. Background & Problem**

Google Maps lists are powerful but limited:

- No list search
- No filtering
- No metadata
- No curation marketplace
- No monetization
- No discoverability
- No protection of creator curation work

Users have massive collections of saved places that remain unusable.

We solve this by importing Google data, enriching it, and turning it into:

- A **personal knowledge layer**
- A **marketplace of curated city guides**
- A **reputation and staking ecosystem**

---

# **2. Product Vision**

### **“Transform your saved places into a searchable database, a marketplace of curated travel guides, and a reputation-driven knowledge economy.”**

The app introduces:

- Personal search engine
- Marketplace for curated lists
- TRUST staking as a reputation signal
- Earnable revenue for creators and stakers
- Export to Google Maps
- Protected creator IP (no cloning purchased lists)

---

# **3. Key User Types**

### **Explorer**

Buys lists, explores content, exports to Google Maps.

### **Creator**

Publishes curated lists, earns revenue and reputation.

### **Staker / Curator**

Deposits TRUST on lists they believe in, earning a share of revenue.

### **Reputable Expert**

High-reputation creator (trust-weighted), easily discoverable.

---

# **4. Core Modules**

1. **Import Module** — upload Takeout ZIP → parse → enrich → search
2. **Personal Library** — manage, tag, filter, and organize your places
3. **Marketplace** — public & private paid lists
4. **Purchasing System** — unlock lists with protections
5. **Staking System** — TRUST staking simulation + economic rewards
6. **Reputation System** — creators + lists + users
7. **Export System** — send lists back to Google Maps

---

# **5. Data Input & Output (unchanged)**

### **Inputs:**

- Google Takeout JSON / GeoJSON / CSV
- Manual metadata (notes, tags, vibes)
- Marketplace metadata

### **Outputs:**

- Readable enriched lists
- Marketplace listings
- Creator profiles
- TRUST-based rankings
- Export: KML, GeoJSON, CSV

---

# **6. Personal Knowledge Layer**

*(Same as before — unchanged except to clarify purchased lists live in their own permission mode.)*

Users can:

- Search all saved places
- Filter by city, cuisine, vibes, rating
- Create new personal lists
- Add metadata
- Export lists back into Google Maps

**Purchased Lists appear in a separate read-only section**, reflecting protection rules.

---

# **7. Marketplace (Updated)**

## **7.1 Marketplace Visibility**

### **Public Lists (Free or Paid)**

- Visible in full marketplace feed
- List preview shows full contents (if free)
- If *public paid*:
    - High-level info visible
    - Full content locked until purchase
- After purchase:
    - User may view full content
    - Export to Google Maps
    - Cannot clone or edit

### **Private Lists (Paid)**

- Appear in search and marketplace just like any other list
- Preview includes: title, cover, description, tags, city, category
- **All detailed list contents are hidden until purchase**
- After purchase:
    - User may view the content
    - Export to Google Maps
    - **Cannot clone, edit, copy, or remix** inside the app

This protects creators’ curation work.

---

## **7.2 Purchase Restrictions (Updated)**

Purchased lists:

### **❌ Cannot be:**

- Cloned
- Edited
- Merged
- Duped
- Added to personal lists
- Re-shared at list level

### **✔ Can be:**

- Viewed
- Browsed in-app
- Exported to Google Maps
- Staked upon
- Rated/reviewed

This creates the digital equivalent of **view-only intellectual property**, similar to licensing a guidebook.

---

# **8. Revenue Distribution (Updated)**

When a private list is purchased:

### **65% — Creator**

Rewarding original labor and curation quality.

### **25% — Stakers**

Distributed proportionally to TRUST signal on the list.

### **10% — Protocol**

Platform sustainability fee.

This is the final split and is now applied across:

- Purchases
- Future recurring unlocks
- Marketplace activity

### **Prototype Implementation**

Simulated revenue flow displayed in UI.

### **Future Intuition Integration**

On-chain automated distribution via Signal staking vaults.

---

# **9. TRUST Staking (Updated)**

### **General Rules:**

- Only users who **purchased** the list may stake TRUST on it.
- Free lists allow staking by anyone.

### **TRUST Staking Effects:**

- Increases a list’s **Trust Rank**
- Contributes to creator **reputation**
- Determines staking rewards

### **Staking Rewards:**

- 25% of every purchase → paid to stakers
- Distributed proportionally

### **Staking UX:**

- After unlocking a list: “Stake TRUST to support this creator and earn revenue.”
- Stakes are visible publicly (Trust Rank section).

---

# **10. Creator Profiles (Updated)**

Each creator has:

- Name
- Bio
- Social links
- Total TRUST staked on their lists
- Creator Reputation Score
- Earnings
- Portfolio (public + private lists)
- “Top Lists” section ranked by Trust Rank

---

# **11. Creator Reputation Score (Updated)**

### **Creator Reputation =**

(Weighted combination)

- TRUST staked on their lists
- TRUST staked on **their user profile**
- Ratings on lists
- Total list sales
- Staker ROI on their lists
- Volume of stakers
- Number of high-ranking lists

This enables filters such as:

- “Show me high-reputation creators”
- “Show me creators with strong staker ROI”
- “Show me creators with lists that have never been disputed”

This is a precursor to Intuition DID + on-chain reputation.

---

# **12. Staking on Users (Updated)**

Users can stake TRUST on other **users**, just like they stake on lists.

Effects:

- Boosts the user’s Creator Reputation
- Unlocks a new discovery vector
- Allows filtering for the best list-makers

### **Staking Rewards on Users**

Prototype: Simulated (display only)

Future: Part of a global reputation economy, not necessarily tied to direct revenue.

---

# **13. Marketplace Search + Filtering (Updated)**

Marketplace can be filtered by:

- Free lists
- Paid lists
- **Private paid lists (locked)**
- Top TRUST rank
- Top creators by reputation
- Most purchased
- Highest earning
- Highest staker APR
- Trending creators
- Trending lists

---

# **14. Purchased List Behaviors (Updated)**

Purchased lists are **read-only assets**.

View Mode includes:

- Place list
- Notes (if creator chooses to share)
- Tags
- Map view
- Metadata
- Export button

Editing buttons are disabled with tooltip:

**“Editing disabled to protect creator’s work. You may export this list to Google Maps.”**

---

# **15. Technical Architecture (Updated)**

### **Additional Tables**

- purchased_lists (with read-only flag)
- list_permissions
- list_readonly_views
- list_staking_records
- creator_earnings
- staking_rewards_history
- user_stake_profiles

Everything is designed for future conversion into Intuition’s on-chain structures.

---

# **16. Hackathon Scope (Updated)**

### **Must-Haves**

- Import personal lists
- Build marketplace (public + private)
- Purchase simulation
- TRUST staking simulation
- Revenue distribution engine (simulated with updated split)
- Protect purchased lists (read-only + export-only)
- Creator profiles + reputation
- Staking on users
- Marketplace search & filter overhaul

### **Nice-to-Haves**

- Partial blurred previews
- Staker ROI display
- Advanced recommendation engine
- Following creators

---

# **17. Post-Hackathon (Web3 Integration)**

- Convert marketplace lists → atoms
- Convert metadata → triples
- Convert staking → Signal
- Use TRUST as real staking token
- Apply bonding curves to lists
- Enable on-chain revenue distribution
- Enable DID-bound creator identities
- Convert reputation into on-chain composable credentials

---

# **18. Final Vision**

You now have:

- A **search engine for personal location data**
- A **marketplace for curated travel knowledge**
- A **stake-based ranking economy**
- A **trust-weighted creator reputation graph**
- A framework to port all of this into **Intuition’s on-chain knowledge graph**

This is a beautiful demonstration of Intuition’s philosophy:

**information as an asset class, truth as signal, reputation as capital.**