/**
 * ECサイト商品管理システム データベース設計
 * 
 * このファイルは、本番環境で使用することを想定したRDBのスキーマ定義です。
 * PostgreSQL/MySQL互換の構文で記述しています。
 */

-- =====================================
-- カテゴリーテーブル
-- =====================================
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,                    -- UUID v4推奨
    name VARCHAR(100) NOT NULL,                    -- カテゴリー名
    description TEXT,                              -- カテゴリー説明
    parent_id VARCHAR(36),                         -- 親カテゴリーID（自己参照）
    path VARCHAR(500) NOT NULL,                    -- パス（例: "electronics/computers/laptops"）
    level INT NOT NULL DEFAULT 0,                  -- 階層レベル（0がルート）
    sort_order INT NOT NULL DEFAULT 0,             -- 表示順序
    is_active BOOLEAN NOT NULL DEFAULT TRUE,       -- 有効フラグ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),                       -- 作成者
    updated_by VARCHAR(100),                       -- 更新者
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_path (path),
    INDEX idx_categories_active (is_active)
);

-- =====================================
-- タグマスターテーブル
-- =====================================
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,              -- タグ名（ユニーク）
    color VARCHAR(50) NOT NULL DEFAULT 'badge-ghost', -- 表示色クラス
    description TEXT,                              -- タグ説明
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tags_name (name),
    INDEX idx_tags_active (is_active)
);

-- =====================================
-- 商品テーブル
-- =====================================
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,                    -- 商品名
    description TEXT,                              -- 商品説明
    price DECIMAL(12,2) NOT NULL DEFAULT 0,       -- 価格（小数点2桁まで）
    category_id VARCHAR(36) NOT NULL,              -- カテゴリーID
    stock INT NOT NULL DEFAULT 0,                  -- 在庫数
    stock_status VARCHAR(20) NOT NULL DEFAULT 'out_of_stock', -- in_stock/low_stock/out_of_stock
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active/inactive/discontinued
    sku VARCHAR(100) UNIQUE,                       -- 商品コード（任意）
    barcode VARCHAR(100),                          -- バーコード
    weight DECIMAL(10,3),                          -- 重量（kg）
    dimensions_length DECIMAL(10,2),               -- 長さ（cm）
    dimensions_width DECIMAL(10,2),                -- 幅（cm）
    dimensions_height DECIMAL(10,2),               -- 高さ（cm）
    meta_title VARCHAR(200),                       -- SEO用タイトル
    meta_description TEXT,                         -- SEO用説明
    meta_keywords TEXT,                            -- SEOキーワード
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status),
    INDEX idx_products_stock_status (stock_status),
    INDEX idx_products_sku (sku),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_created (created_at),
    INDEX idx_products_updated (updated_at)
);

-- =====================================
-- 商品タグ関連テーブル（多対多）
-- =====================================
CREATE TABLE product_tags (
    product_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_product_tags_tag (tag_id)
);

-- =====================================
-- 商品リソーステーブル（画像・動画・PDF等）
-- =====================================
CREATE TABLE product_resources (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL,                     -- image/video/document/other
    url TEXT NOT NULL,                             -- リソースURL
    filename VARCHAR(255) NOT NULL,                -- ファイル名
    alt_text VARCHAR(500),                         -- 代替テキスト（主に画像用）
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,     -- メインリソースフラグ
    sort_order INT NOT NULL DEFAULT 0,             -- 表示順序
    file_size BIGINT,                              -- ファイルサイズ（バイト）
    mime_type VARCHAR(100),                        -- MIMEタイプ
    width INT,                                     -- 幅（画像・動画用）
    height INT,                                    -- 高さ（画像・動画用）
    duration INT,                                  -- 再生時間（動画用、秒）
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_resources_product (product_id),
    INDEX idx_product_resources_type (type),
    INDEX idx_product_resources_primary (is_primary),
    INDEX idx_product_resources_sort (sort_order)
);

-- =====================================
-- 価格履歴テーブル
-- =====================================
CREATE TABLE price_history (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    price DECIMAL(12,2) NOT NULL,                  -- 価格
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100) NOT NULL,              -- 変更者
    change_reason VARCHAR(500),                    -- 変更理由
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_price_history_product (product_id),
    INDEX idx_price_history_changed (changed_at)
);

-- =====================================
-- 在庫履歴テーブル
-- =====================================
CREATE TABLE stock_history (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,                         -- 数量（正負の値）
    type VARCHAR(20) NOT NULL,                     -- addition/removal/adjustment
    reason VARCHAR(500) NOT NULL,                  -- 理由
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100) NOT NULL,              -- 変更者
    reference_type VARCHAR(50),                    -- 参照タイプ（order/return/adjustment等）
    reference_id VARCHAR(36),                      -- 参照ID（注文ID等）
    stock_before INT NOT NULL,                     -- 変更前在庫
    stock_after INT NOT NULL,                      -- 変更後在庫
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_stock_history_product (product_id),
    INDEX idx_stock_history_changed (changed_at),
    INDEX idx_stock_history_type (type),
    INDEX idx_stock_history_reference (reference_type, reference_id)
);

-- =====================================
-- トリガー: 商品更新時のタイムスタンプ自動更新
-- =====================================
-- PostgreSQL版
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_resources_updated_at BEFORE UPDATE ON product_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- トリガー: 在庫変更時の自動記録
-- =====================================
CREATE OR REPLACE FUNCTION record_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stock != NEW.stock THEN
        INSERT INTO stock_history (
            id,
            product_id,
            quantity,
            type,
            reason,
            changed_by,
            stock_before,
            stock_after
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.stock - OLD.stock,
            CASE 
                WHEN NEW.stock > OLD.stock THEN 'addition'
                WHEN NEW.stock < OLD.stock THEN 'removal'
                ELSE 'adjustment'
            END,
            'システム自動記録',
            COALESCE(NEW.updated_by, 'SYSTEM'),
            OLD.stock,
            NEW.stock
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER record_product_stock_change AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION record_stock_change();

-- =====================================
-- トリガー: 価格変更時の自動記録
-- =====================================
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.price != NEW.price THEN
        INSERT INTO price_history (
            id,
            product_id,
            price,
            changed_by,
            change_reason
        ) VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.price,
            COALESCE(NEW.updated_by, 'SYSTEM'),
            'システム自動記録'
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER record_product_price_change AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION record_price_change();

-- =====================================
-- ビュー: カテゴリー階層ビュー
-- =====================================
CREATE OR REPLACE VIEW v_category_tree AS
WITH RECURSIVE category_tree AS (
    -- ルートカテゴリー
    SELECT 
        id,
        name,
        description,
        parent_id,
        path,
        level,
        sort_order,
        is_active,
        CAST(name AS VARCHAR(1000)) as full_path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- 子カテゴリー
    SELECT 
        c.id,
        c.name,
        c.description,
        c.parent_id,
        c.path,
        c.level,
        c.sort_order,
        c.is_active,
        CAST(ct.full_path || ' > ' || c.name AS VARCHAR(1000)) as full_path
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, sort_order, name;

-- =====================================
-- ビュー: 商品統計ビュー
-- =====================================
CREATE OR REPLACE VIEW v_product_stats AS
SELECT 
    p.category_id,
    c.name as category_name,
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_count,
    COUNT(DISTINCT CASE WHEN p.stock_status = 'out_of_stock' THEN p.id END) as out_of_stock_count,
    COUNT(DISTINCT CASE WHEN p.stock_status = 'low_stock' THEN p.id END) as low_stock_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price,
    SUM(p.stock) as total_stock,
    SUM(p.price * p.stock) as total_value
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY p.category_id, c.name;

-- =====================================
-- インデックス: パフォーマンス最適化
-- =====================================
-- 複合インデックス（よく使われる検索条件）
CREATE INDEX idx_products_search ON products(status, stock_status, category_id);
CREATE INDEX idx_products_price_range ON products(price, status);

-- 全文検索用インデックス（PostgreSQL）
CREATE INDEX idx_products_fulltext ON products USING gin(to_tsvector('japanese', name || ' ' || COALESCE(description, '')));

-- =====================================
-- 初期データ（マスターデータ）
-- =====================================
-- デフォルトタグ
INSERT INTO tags (id, name, color, description) VALUES
    ('tag-new', '新商品', 'badge-primary', '新しく追加された商品'),
    ('tag-sale', 'セール', 'badge-secondary', 'セール対象商品'),
    ('tag-popular', '人気商品', 'badge-accent', '売上上位の商品'),
    ('tag-limited', '限定品', 'badge-warning', '数量限定商品'),
    ('tag-eco', 'エコ商品', 'badge-success', '環境に優しい商品'),
    ('tag-premium', 'プレミアム', 'badge-info', '高級商品'),
    ('tag-lastchance', '在庫わずか', 'badge-error', '在庫が少ない商品'),
    ('tag-recommend', 'おすすめ', 'badge-ghost', 'スタッフおすすめ商品');