---
Type: doc
Title: Utility
Order: 30
---


# AttributeManager
Class that manages attributes.
It has attribute set delay, delay watch, attribute multicast implementation.
## Constructor
```typescript
New AttributeManager (tag: string);
```

+ `Tag` A string for identification. It is added to the warning from the inside.
## method
### addAttribute
```typescript
Public addAttribute (attr: Attribute): Attribute
```
Attributes are added, and attributes added are returned.
Warn if added attribute name already exists.
If there is a delay set or a delay watch for this attribute, it processes it.

### watch
```typescript
NSIdentity, watcher: (newValue: any, oldValue: any, attr: Attribute) => void, immediate = false): void
```
Watch attributes.
When an attribute is specified with NSIdentity, watch all the corresponding attributes.
When specified by an attribute name, if all the corresponding attributes are in the same namespace, we watch them all.
If there is something of a different namespace, we throw an exception.

### setAttribute
```typescript
Public setAttribute (attrName: string | NSIdentity, value: any): void
```
Set attributes.
If an attribute is specified with NSIdentity, set it to all the corresponding attributes.
When specified by attribute name, if all the corresponding attributes belong to the same namespace, set them to all of them.
If there is something of a different namespace, we throw an exception.

### getAttribute
Get the attribute.
If there are multiple attributes corresponding to the specified attribute name or NSIdentity, an exception will be thrown.

## # remove Attribute
Delete the attribute.
Returns true if the attribute exists and succeeds in deletion, false if it does not exist.

# Constants
Manage constants
## static constant
### defaultNamespace
Default namespace.
"http://GRIMOIRE.GL/NS/DEFAULT"
### x_gr_id
"X-gr-id"

# Ensure
Unify the values ​​in the correct format.
## Static Method
### tobe String
Convert string or number to a string.
### tobeNumber
### tobeNSIdentity
### tobeNSIdentityArray
### tobeNSDictionary
### tobeMessage
### tobeComponentConstructor


# NSDictionary
# NSIdentity
