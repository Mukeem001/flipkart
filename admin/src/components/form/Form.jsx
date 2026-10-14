import { AddProduct } from "../../service/OrderApi";
import "./Form.css";
import { useState, useRef } from "react";

const Form = () => {
  const [formData, setFormData] = useState({
    shorttitle: "",
    longtitle: "",
    category: "",
    mrp: "",
    cost: "",
    discount: "",
    quantity: 1,
    description: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFeedback({ type: "error", text: "Please select an image file (PNG, JPG, WEBP)." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({ type: "error", text: "Image must be 5 MB or smaller." });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFeedback({ type: "", text: "" });
    }
  };

  const removeSelectedImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!imageFile && !formData.imageUrl.trim()) {
      setFeedback({ type: "error", text: "Upload a product image or provide an image URL." });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", text: "" });

    const data = new FormData();
    if (imageFile) data.append("image", imageFile);
    data.append("imageUrl", formData.imageUrl.trim());
    data.append("shorttitle", formData.shorttitle);
    data.append("longtitle", formData.longtitle);
    data.append("category", formData.category);
    data.append("mrp", formData.mrp);
    data.append("cost", formData.cost);
    data.append("discount", formData.discount);
    data.append("quantity", formData.quantity);
    data.append("description", formData.description);

    AddProduct(data).then(() => {
        setLoading(false);
        setFeedback({ type: "success", text: "Product uploaded successfully!" });
        setFormData({
          shorttitle: "",
          longtitle: "",
          category: "",
          mrp: "",
          cost: "",
          discount: "",
          quantity: 1,
          description: "",
          imageUrl: "",
        });
        setImageFile(null);
        setImagePreview("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      })
      .catch((err) => {
        setLoading(false);
        setFeedback({ 
          type: "error", 
          text: err.response?.data?.message || "Failed to upload product. Check backend server and try again." 
        });
        console.error("Error adding product:", err);
      });
  };

  return (
    <div className="form-wrapper">
      <h2>Add New Product</h2>
      
      {feedback.text && (
        <div className={`feedback-alert ${feedback.type}`}>
          <i className={feedback.type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
          <span>{feedback.text}</span>
        </div>
      )}

      <form className="product-form" onSubmit={handleSubmit}>

        <div className="form-row full">
          <label className="field-label">Product Image</label>
          <div 
            className={`upload-zone ${imagePreview ? "has-image" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
            />
            
            {!imagePreview ? (
              <div className="upload-placeholder">
                <i className="fas fa-cloud-upload-alt upload-icon"></i>
                <p className="upload-text">Click or Drag to Upload Product Image</p>
                <span className="upload-subtext">Supports PNG, JPG, JPEG, WEBP (Max 5MB)</span>
              </div>
            ) : (
              <div className="upload-preview-container">
                <img src={imagePreview} alt="Preview" className="upload-preview-img" />
                <button type="button" className="remove-img-btn" onClick={removeSelectedImage}>
                  <i className="fas fa-trash-alt"></i> Remove Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-row full">
          <label htmlFor="imageUrl">Or use an image URL</label>
          <input
            id="imageUrl"
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/product-image.jpg"
          />
        </div>

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
            <label>Category</label>
            <input type="text" value={formData.category} name="category" onChange={handleChange} required />
          </div>
          <div>
            <label>Discount</label>
            <input type="text" value={formData.discount} name="discount" onChange={handleChange} required />
          </div>
        </div>

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
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
                Uploading...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;