import { AddProduct, UpdateProduct } from "../../service/OrderApi";
import "./Form.css";
import { useState } from "react";
import { FASHION_TYPES, PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SIZES } from "../../constants/productCategories";

const getInitialFormData = (product) => ({
    shorttitle: "",
    longtitle: "",
    category: "",
    mrp: "",
    cost: "",
    discount: "",
    quantity: 1,
    emiAvailable: true,
    description: "",
    imageUrl: "",
    galleryImages: [],
    productType: "",
    colors: [],
    colorImages: {},
    sizes: [],
    ...(product ? {
      shorttitle: product.title?.shortTitle || "",
      longtitle: product.title?.longTitle || "",
      category: product.category || "",
      mrp: product.price?.mrp ?? "",
      cost: product.price?.cost ?? "",
      discount: product.price?.discount || "",
      quantity: product.quantity ?? 1,
      emiAvailable: Boolean(product.emiAvailable),
      description: product.description || "",
      imageUrl: product.detailUrl || "",
      galleryImages: product.galleryImages || [],
      productType: product.variantType || "",
      colors: product.colors || [],
      colorImages: Object.fromEntries((product.colorImages || []).map(item => [
        item.color,
        item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : [""],
      ])),
      sizes: product.sizes || [],
    } : {}),
});

const Form = ({ product, onSaved }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(product));

  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "imageUrl") setImagePreviewFailed(false);
    if (name === "category") {
      const category = PRODUCT_CATEGORIES.find(option => option.label === value);
      setFormData(current => ({
        ...current,
        category: value,
        productType: category?.type === "fashion" ? "clothing" : "",
        colors: [],
        colorImages: {},
        sizes: [],
      }));
      return;
    }
    if (name === "productType") {
      setFormData(current => ({ ...current, productType: value, sizes: [] }));
      return;
    }
    setFormData(current => ({ ...current, [name]: value }));
  };

  const toggleOption = (field, option) => {
    setFormData(current => ({
      ...current,
      [field]: current[field].includes(option)
        ? current[field].filter(value => value !== option)
        : [...current[field], option],
    }));
  };

  const updateGalleryImage = (index, value) => {
    setFormData(current => ({
      ...current,
      galleryImages: current.galleryImages.map((image, imageIndex) => imageIndex === index ? value : image),
    }));
  };

  const updateColorImage = (color, value) => {
    setFormData(current => ({
      ...current,
      colorImages: {
        ...current.colorImages,
        [color]: current.colorImages[color].map((imageUrl, index) => index === value.index ? value.url : imageUrl),
      },
    }));
  };

  const addColorImage = color => {
    setFormData(current => ({
      ...current,
      colorImages: {
        ...current.colorImages,
        [color]: [...(current.colorImages[color] || []), ""],
      },
    }));
  };

  const removeColorImage = (color, index) => {
    setFormData(current => ({
      ...current,
      colorImages: {
        ...current.colorImages,
        [color]: current.colorImages[color].filter((_, imageIndex) => imageIndex !== index),
      },
    }));
  };

  const toggleColor = (color) => {
    setFormData(current => {
      const selected = current.colors.includes(color);
      const colorImages = { ...current.colorImages };
      if (selected) delete colorImages[color];
      else colorImages[color] = [""];
      return {
        ...current,
        colors: selected ? current.colors.filter(value => value !== color) : [...current.colors, color],
        colorImages,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.imageUrl.trim()) {
      setFeedback({ type: "error", text: "Enter a product image URL to see its preview and add the product." });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", text: "" });

    const data = new FormData();
    data.append("imageUrl", formData.imageUrl.trim());
    data.append("galleryImages", JSON.stringify(formData.galleryImages.map(url => url.trim()).filter(Boolean)));
    data.append("colorImages", JSON.stringify(
      Object.entries(formData.colorImages)
        .filter(([color]) => formData.colors.includes(color))
        .map(([color, imageUrls]) => ({
          color,
          imageUrls: imageUrls.map(imageUrl => imageUrl.trim()).filter(Boolean),
        }))
        .filter(({ imageUrls }) => imageUrls.length > 0)
    ));
    data.append("shorttitle", formData.shorttitle);
    data.append("longtitle", formData.longtitle);
    data.append("category", formData.category);
    data.append("mrp", formData.mrp);
    data.append("cost", formData.cost);
    data.append("discount", formData.discount);
    data.append("quantity", formData.quantity);
    data.append("emiAvailable", String(formData.emiAvailable));
    data.append("description", formData.description);
    data.append("variantType", formData.productType);
    data.append("colors", JSON.stringify(formData.colors));
    data.append("sizes", JSON.stringify(formData.sizes));

    try {
      if (product?._id) {
        await UpdateProduct(product._id, data);
        setFeedback({ type: "success", text: "Product updated successfully!" });
        onSaved?.();
      } else {
        await AddProduct(data);
        setFeedback({ type: "success", text: "Product added successfully!" });
        setFormData({
          shorttitle: "",
          longtitle: "",
          category: "",
          mrp: "",
          cost: "",
          discount: "",
          quantity: 1,
          emiAvailable: true,
          description: "",
          imageUrl: "",
          galleryImages: [],
          productType: "",
          colors: [],
          colorImages: {},
          sizes: [],
        });
        setImagePreviewFailed(false);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Failed to add product. Check the backend connection and try again."
      });
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = PRODUCT_CATEGORIES.find(category => category.label === formData.category);
  const availableSizes = PRODUCT_SIZES[formData.productType] || [];

  return (
    <div className="form-wrapper">
      <h2>{product ? "Edit Product" : "Add New Product"}</h2>
      
      {feedback.text && (
        <div className={`feedback-alert ${feedback.type}`}>
          <i className={feedback.type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
          <span>{feedback.text}</span>
        </div>
      )}

      <form className="product-form" onSubmit={handleSubmit}>

        <div className="form-row full">
          <label htmlFor="imageUrl">Product image URL <span className="required-mark">*</span></label>
          <input
            id="imageUrl"
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/product-image.jpg"
          />
          {formData.imageUrl && (
            <div className="product-image-preview" aria-live="polite">
              {imagePreviewFailed
                ? <p className="image-preview-error">Image preview unavailable. Check that the URL points directly to an image.</p>
                : <img src={formData.imageUrl} alt="Product preview" onError={() => setImagePreviewFailed(true)} />}
            </div>
          )}
        </div>

        <section className="image-variants-section" aria-label="Product image gallery">
          <div className="image-variants-heading">
            <h3>More product images</h3>
            <p>Add optional image URLs customers can swipe through on the product page.</p>
          </div>
          {formData.galleryImages.map((imageUrl, index) => (
            <div className="extra-image-field" key={`gallery-${index}`}>
              <div className="form-row">
                <label htmlFor={`galleryImage-${index}`}>Gallery image {index + 1} URL</label>
                <input
                  id={`galleryImage-${index}`}
                  type="url"
                  value={imageUrl}
                  onChange={event => updateGalleryImage(index, event.target.value)}
                  placeholder="https://example.com/another-view.jpg"
                />
              </div>
              <button
                className="remove-image-button"
                type="button"
                aria-label={`Remove gallery image ${index + 1}`}
                onClick={() => setFormData(current => ({
                  ...current,
                  galleryImages: current.galleryImages.filter((_, imageIndex) => imageIndex !== index),
                }))}
              >Remove</button>
              {imageUrl && <img className="variant-image-preview" src={imageUrl} alt={`Gallery preview ${index + 1}`} />}
            </div>
          ))}
          <button
            className="add-image-button"
            type="button"
            onClick={() => setFormData(current => ({ ...current, galleryImages: [...current.galleryImages, ""] }))}
          >+ Add another image</button>
        </section>

        <div className="form-row two-col">
          <div>
            <label>Short Title</label>
            <input type="text" value={formData.shorttitle} name="shorttitle" onChange={handleChange} required />
          </div>
          <div>
            <label>Long Title</label>
            <input type="text" value={formData.longtitle} name="longtitle" onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label htmlFor="category">Category <span className="required-mark">*</span></label>
            <select id="category" value={formData.category} name="category" onChange={handleChange} required>
              <option value="" disabled>Select a product category</option>
              {PRODUCT_CATEGORIES.map(category => <option key={category.label} value={category.label}>{category.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="discount">Discount</label>
            <input type="text" value={formData.discount} name="discount" onChange={handleChange} required />
          </div>
        </div>

        {selectedCategory && <section className="variant-fields" aria-label="Product variants">
          <div className="variant-fields-heading">
            <h3>Variants</h3>
            <p>Options selected here are shown to customers on the product page.</p>
          </div>

          {selectedCategory.type === "fashion" && <>
            <div className="form-row">
              <label htmlFor="productType">Fashion type</label>
              <select id="productType" name="productType" value={formData.productType} onChange={handleChange}>
                {FASHION_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
          </>}

          {selectedCategory.hasColors && <fieldset className="variant-choice-group">
            <legend>Available colors <span className="optional-mark">(optional)</span></legend>
            <div className="variant-choice-list">
              {PRODUCT_COLORS.map(color => <label className={`variant-choice ${formData.colors.includes(color) ? "selected" : ""}`} key={color}>
                <input type="checkbox" checked={formData.colors.includes(color)} onChange={() => toggleColor(color)} />
                <span className={`color-swatch color-swatch-${color.toLowerCase()}`} />
                {color}
              </label>)}
            </div>
          </fieldset>}

          {formData.colors.length > 0 && <section className="color-image-fields" aria-label="Color-specific product images">
            <div className="image-variants-heading">
              <h3>Images for each color</h3>
              <p>Add a main image and optional extra images for each color. The client gallery will only show images for the selected color.</p>
            </div>
            {formData.colors.map(color => (
              <section className="color-image-group" key={color} aria-label={`${color} images`}>
                <h4>
                  <span className={`color-swatch color-swatch-${color.toLowerCase()}`} />
                  {color}
                </h4>
                {(formData.colorImages[color] || []).map((imageUrl, index) => (
                  <div className="color-image-field" key={`${color}-${index}`}>
                    <label htmlFor={`colorImage-${color}-${index}`}>
                      {index === 0 ? "Main image URL" : `Extra image ${index} URL`}
                    </label>
                    <input
                      id={`colorImage-${color}-${index}`}
                      type="url"
                      value={imageUrl}
                      onChange={event => updateColorImage(color, { index, url: event.target.value })}
                      placeholder={`https://example.com/${color.toLowerCase()}-${index === 0 ? "main" : `view-${index}`}.jpg`}
                    />
                    <button
                      className="remove-image-button"
                      type="button"
                      aria-label={`Remove ${color} image ${index + 1}`}
                      onClick={() => removeColorImage(color, index)}
                    >Remove</button>
                    {imageUrl && <img className="variant-image-preview" src={imageUrl} alt={`${color} image preview ${index + 1}`} />}
                  </div>
                ))}
                <button className="add-image-button" type="button" onClick={() => addColorImage(color)}>
                  + Add {color} image
                </button>
              </section>
            ))}
          </section>}

          {availableSizes.length > 0 && <fieldset className="variant-choice-group">
            <legend>Available sizes <span className="optional-mark">(optional)</span></legend>
            <div className="variant-choice-list size-choice-list">
              {availableSizes.map(size => <label className={`variant-choice size-choice ${formData.sizes.includes(size) ? "selected" : ""}`} key={size}>
                <input type="checkbox" checked={formData.sizes.includes(size)} onChange={() => toggleOption("sizes", size)} />
                {size}
              </label>)}
            </div>
          </fieldset>}

          {!selectedCategory.hasColors && availableSizes.length === 0 && (
            <p className="variant-fields-empty">This category does not use color or size variants.</p>
          )}
        </section>}

        <div className="form-row three-col">
          <div>
            <label>MRP</label>
            <input type="number" min="0" value={formData.mrp} name="mrp" onChange={handleChange} required />
          </div>
          <div>
            <label>Cost</label>
            <input type="number" min="0" value={formData.cost} name="cost" onChange={handleChange} required />
          </div>
          <div>
            <label>Quantity</label>
            <input type="number" min="0" value={formData.quantity} name="quantity" onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row full">
          <label>EMI availability</label>
          <div className="flex gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="emiAvailable"
                checked={formData.emiAvailable === true}
                onChange={() => setFormData((current) => ({ ...current, emiAvailable: true }))}
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="emiAvailable"
                checked={formData.emiAvailable === false}
                onChange={() => setFormData((current) => ({ ...current, emiAvailable: false }))}
              />
              Not available
            </label>
          </div>
        </div>

        <div className="form-row full">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
                Uploading...
              </>
            ) : (
              product ? "Save Changes" : "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;